"""
Nyaya Saathi — LLM Client
===========================
Abstracted LLM client with:
  - Multi-provider support (OpenAI, Google, Anthropic)
  - Retries with exponential backoff
  - Timeout enforcement
  - Model fallback (primary → fallback)
  - Structured output enforcement (JSON mode / function calling)
  - Per-call logging (model, tokens, latency, cost, prompt version)
  - Cost tracking with daily alerts
"""

from __future__ import annotations

import asyncio
import json
import logging
import time
import uuid
from dataclasses import dataclass, field
from datetime import date, datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional, Type

from pydantic import BaseModel

from app.ai.config import (
    FALLBACK_LLM_MODEL,
    LLM_MAX_RETRIES,
    LLM_PROVIDER,
    LLM_RETRY_BACKOFF_BASE,
    LLM_TIMEOUT_SECONDS,
    MAX_OUTPUT_TOKENS,
    PRIMARY_LLM_MODEL,
    TEMPERATURE,
    TOP_P,
    COST_ALERT_DAILY_USD,
    PROMPT_VERSIONS,
)

logger = logging.getLogger("nyaya_saathi.ai.llm")


# ---------------------------------------------------------------------------
# Cost estimation table (USD per 1K tokens) — update as pricing changes
# ---------------------------------------------------------------------------

_COST_PER_1K: Dict[str, Dict[str, float]] = {
    "gpt-4o":        {"input": 0.0025,  "output": 0.010},
    "gpt-4o-mini":   {"input": 0.00015, "output": 0.0006},
    "gpt-4-turbo":   {"input": 0.01,    "output": 0.03},
    "gpt-3.5-turbo": {"input": 0.0005,  "output": 0.0015},
}


# ---------------------------------------------------------------------------
# Data classes
# ---------------------------------------------------------------------------

class LLMCallStatus(str, Enum):
    SUCCESS = "success"
    RETRY = "retry"
    FALLBACK = "fallback"
    FAILED = "failed"


@dataclass
class LLMCallLog:
    """Structured log entry for every LLM invocation."""
    call_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    case_id: Optional[str] = None
    step: Optional[str] = None                   # classify, retrieve, generate, etc.
    model: str = ""
    prompt_version: Optional[str] = None
    input_tokens: int = 0
    output_tokens: int = 0
    total_tokens: int = 0
    latency_ms: int = 0
    cost_usd: float = 0.0
    status: LLMCallStatus = LLMCallStatus.SUCCESS
    structured_output_valid: bool = True
    error_message: Optional[str] = None
    created_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )

    def to_dict(self) -> Dict[str, Any]:
        return {
            "call_id": self.call_id,
            "case_id": self.case_id,
            "step": self.step,
            "model": self.model,
            "prompt_version": self.prompt_version,
            "input_tokens": self.input_tokens,
            "output_tokens": self.output_tokens,
            "total_tokens": self.total_tokens,
            "latency_ms": self.latency_ms,
            "cost_usd": round(self.cost_usd, 6),
            "status": self.status.value,
            "structured_output_valid": self.structured_output_valid,
            "error_message": self.error_message,
            "created_at": self.created_at,
        }


# ---------------------------------------------------------------------------
# Daily cost tracker (in-memory; for production, back with Redis/DB)
# ---------------------------------------------------------------------------

class _DailyCostTracker:
    """Tracks cumulative daily token spend."""

    def __init__(self) -> None:
        self._date: Optional[date] = None
        self._total_usd: float = 0.0
        self._total_input_tokens: int = 0
        self._total_output_tokens: int = 0
        self._alerted: bool = False

    def record(self, cost_usd: float, input_tokens: int, output_tokens: int) -> None:
        today = date.today()
        if self._date != today:
            self._date = today
            self._total_usd = 0.0
            self._total_input_tokens = 0
            self._total_output_tokens = 0
            self._alerted = False

        self._total_usd += cost_usd
        self._total_input_tokens += input_tokens
        self._total_output_tokens += output_tokens

        if self._total_usd >= COST_ALERT_DAILY_USD and not self._alerted:
            logger.warning(
                "daily_cost_alert",
                extra={
                    "total_usd": round(self._total_usd, 4),
                    "threshold_usd": COST_ALERT_DAILY_USD,
                    "total_input_tokens": self._total_input_tokens,
                    "total_output_tokens": self._total_output_tokens,
                },
            )
            self._alerted = True

    @property
    def total_usd_today(self) -> float:
        today = date.today()
        if self._date != today:
            return 0.0
        return self._total_usd


_cost_tracker = _DailyCostTracker()


# ---------------------------------------------------------------------------
# LLM Client
# ---------------------------------------------------------------------------

class LLMClient:
    """
    Abstracted LLM client for Nyaya Saathi.

    Usage::

        client = LLMClient()

        # Simple completion
        result = await client.complete(
            messages=[{"role": "user", "content": "Hello"}],
            step="classify",
            case_id="case-123",
        )

        # Structured output (returns parsed Pydantic model)
        result = await client.complete_structured(
            messages=[...],
            response_model=ClassificationResult,
            step="classify",
            case_id="case-123",
        )
    """

    def __init__(
        self,
        primary_model: str = PRIMARY_LLM_MODEL,
        fallback_model: str = FALLBACK_LLM_MODEL,
        provider: str = LLM_PROVIDER,
        temperature: float = TEMPERATURE,
        max_output_tokens: int = MAX_OUTPUT_TOKENS,
        timeout: int = LLM_TIMEOUT_SECONDS,
        max_retries: int = LLM_MAX_RETRIES,
    ) -> None:
        self.primary_model = primary_model
        self.fallback_model = fallback_model
        self.provider = provider
        self.temperature = temperature
        self.max_output_tokens = max_output_tokens
        self.timeout = timeout
        self.max_retries = max_retries
        self._client = None  # Lazy-initialised provider client
        self._call_logs: List[LLMCallLog] = []

    # ----- Provider initialisation ------------------------------------------

    def _get_client(self):
        """Lazy-init the provider SDK client."""
        if self._client is not None:
            return self._client

        if self.provider == "openai":
            try:
                from openai import AsyncOpenAI
                from app.core.config import settings
                # We fetch the key directly from the environment or settings to be explicit
                api_key = settings.LLM_API_KEY or __import__('os').getenv("OPENAI_API_KEY")
                self._client = AsyncOpenAI(api_key=api_key)
            except ImportError:
                raise ImportError(
                    "openai package is required. Install with: pip install openai"
                )
        elif self.provider == "google":
            try:
                import google.generativeai as genai
                self._client = genai
            except ImportError:
                raise ImportError(
                    "google-generativeai package is required. "
                    "Install with: pip install google-generativeai"
                )
        elif self.provider == "anthropic":
            try:
                from anthropic import AsyncAnthropic
                self._client = AsyncAnthropic()
            except ImportError:
                raise ImportError(
                    "anthropic package is required. Install with: pip install anthropic"
                )
        else:
            raise ValueError(f"Unsupported LLM provider: {self.provider}")

        return self._client

    # ----- Cost estimation --------------------------------------------------

    @staticmethod
    def _estimate_cost(
        model: str, input_tokens: int, output_tokens: int
    ) -> float:
        rates = _COST_PER_1K.get(model)
        if not rates:
            return 0.0
        return (
            (input_tokens / 1000) * rates["input"]
            + (output_tokens / 1000) * rates["output"]
        )

    # ----- Core completion --------------------------------------------------

    async def _call_openai(
        self,
        model: str,
        messages: List[Dict[str, str]],
        response_format: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Call OpenAI-compatible API."""
        client = self._get_client()

        kwargs: Dict[str, Any] = {
            "model": model,
            "messages": messages,
            "temperature": self.temperature,
            "max_tokens": self.max_output_tokens,
            "top_p": TOP_P,
        }
        if response_format:
            kwargs["response_format"] = response_format

        response = await asyncio.wait_for(
            client.chat.completions.create(**kwargs),
            timeout=self.timeout,
        )

        choice = response.choices[0]
        usage = response.usage

        return {
            "content": choice.message.content,
            "input_tokens": usage.prompt_tokens if usage else 0,
            "output_tokens": usage.completion_tokens if usage else 0,
            "total_tokens": usage.total_tokens if usage else 0,
            "finish_reason": choice.finish_reason,
        }

    async def _call_provider(
        self,
        model: str,
        messages: List[Dict[str, str]],
        response_format: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Dispatch to the configured provider."""
        if self.provider == "openai":
            return await self._call_openai(model, messages, response_format)
        # Future: add google, anthropic implementations
        raise NotImplementedError(f"Provider {self.provider} not yet implemented")

    # ----- Public API: complete ---------------------------------------------

    async def complete(
        self,
        messages: List[Dict[str, str]],
        step: Optional[str] = None,
        case_id: Optional[str] = None,
        response_format: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Call the LLM with retry + fallback.

        Returns dict with keys: content, input_tokens, output_tokens, call_log
        """
        prompt_version = PROMPT_VERSIONS.get(step) if step else None
        last_error: Optional[Exception] = None

        # Try primary model with retries
        for attempt in range(self.max_retries):
            try:
                start = time.monotonic()
                result = await self._call_provider(
                    self.primary_model, messages, response_format
                )
                latency_ms = int((time.monotonic() - start) * 1000)

                cost = self._estimate_cost(
                    self.primary_model,
                    result["input_tokens"],
                    result["output_tokens"],
                )
                _cost_tracker.record(
                    cost, result["input_tokens"], result["output_tokens"]
                )

                call_log = LLMCallLog(
                    case_id=case_id,
                    step=step,
                    model=self.primary_model,
                    prompt_version=prompt_version,
                    input_tokens=result["input_tokens"],
                    output_tokens=result["output_tokens"],
                    total_tokens=result["total_tokens"],
                    latency_ms=latency_ms,
                    cost_usd=cost,
                    status=LLMCallStatus.SUCCESS,
                )
                self._call_logs.append(call_log)

                logger.info(
                    "llm_call_success",
                    extra=call_log.to_dict(),
                )

                return {
                    "content": result["content"],
                    "input_tokens": result["input_tokens"],
                    "output_tokens": result["output_tokens"],
                    "call_log": call_log,
                }

            except asyncio.TimeoutError:
                last_error = asyncio.TimeoutError(
                    f"LLM timeout after {self.timeout}s (attempt {attempt + 1})"
                )
                logger.warning(
                    "llm_timeout",
                    extra={
                        "model": self.primary_model,
                        "attempt": attempt + 1,
                        "timeout_s": self.timeout,
                    },
                )
            except Exception as e:
                last_error = e
                logger.warning(
                    "llm_call_error",
                    extra={
                        "model": self.primary_model,
                        "attempt": attempt + 1,
                        "error": str(e),
                    },
                )

            # Exponential backoff before retry
            if attempt < self.max_retries - 1:
                backoff = LLM_RETRY_BACKOFF_BASE * (2 ** attempt)
                await asyncio.sleep(backoff)

        # Primary failed — try fallback model (single attempt)
        if self.fallback_model and self.fallback_model != self.primary_model:
            logger.warning(
                "llm_fallback_attempt",
                extra={
                    "primary_model": self.primary_model,
                    "fallback_model": self.fallback_model,
                    "primary_error": str(last_error),
                },
            )
            try:
                start = time.monotonic()
                result = await self._call_provider(
                    self.fallback_model, messages, response_format
                )
                latency_ms = int((time.monotonic() - start) * 1000)

                cost = self._estimate_cost(
                    self.fallback_model,
                    result["input_tokens"],
                    result["output_tokens"],
                )
                _cost_tracker.record(
                    cost, result["input_tokens"], result["output_tokens"]
                )

                call_log = LLMCallLog(
                    case_id=case_id,
                    step=step,
                    model=self.fallback_model,
                    prompt_version=prompt_version,
                    input_tokens=result["input_tokens"],
                    output_tokens=result["output_tokens"],
                    total_tokens=result["total_tokens"],
                    latency_ms=latency_ms,
                    cost_usd=cost,
                    status=LLMCallStatus.FALLBACK,
                )
                self._call_logs.append(call_log)

                logger.info(
                    "llm_fallback_success",
                    extra=call_log.to_dict(),
                )

                return {
                    "content": result["content"],
                    "input_tokens": result["input_tokens"],
                    "output_tokens": result["output_tokens"],
                    "call_log": call_log,
                }

            except Exception as fallback_error:
                last_error = fallback_error
                logger.error(
                    "llm_fallback_failed",
                    extra={
                        "fallback_model": self.fallback_model,
                        "error": str(fallback_error),
                    },
                )

        # All attempts exhausted
        call_log = LLMCallLog(
            case_id=case_id,
            step=step,
            model=self.primary_model,
            prompt_version=prompt_version,
            status=LLMCallStatus.FAILED,
            error_message=str(last_error),
        )
        self._call_logs.append(call_log)

        logger.error(
            "llm_call_exhausted",
            extra=call_log.to_dict(),
        )

        raise RuntimeError(
            f"LLM call failed after {self.max_retries} retries + fallback: "
            f"{last_error}"
        )

    # ----- Public API: structured output ------------------------------------

    async def complete_structured(
        self,
        messages: List[Dict[str, str]],
        response_model: Type[BaseModel],
        step: Optional[str] = None,
        case_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Call the LLM with JSON mode and parse into a Pydantic model.

        Returns dict with keys: parsed, raw_content, call_log
        Raises RuntimeError if LLM unavailable or JSON parsing fails after retry.
        """
        response_format = {"type": "json_object"}

        result = await self.complete(
            messages=messages,
            step=step,
            case_id=case_id,
            response_format=response_format,
        )

        raw_content = result["content"]

        # Attempt to parse JSON
        try:
            parsed_json = json.loads(raw_content)
            parsed = response_model.model_validate(parsed_json)
            return {
                "parsed": parsed,
                "raw_content": raw_content,
                "call_log": result["call_log"],
            }
        except (json.JSONDecodeError, Exception) as parse_error:
            logger.warning(
                "structured_output_parse_failed",
                extra={
                    "step": step,
                    "case_id": case_id,
                    "error": str(parse_error),
                    "raw_content_snippet": raw_content[:500],
                },
            )

            # Retry once with a repair prompt
            repair_messages = messages + [
                {"role": "assistant", "content": raw_content},
                {
                    "role": "user",
                    "content": (
                        "Your previous response was not valid JSON. "
                        "Please respond again with ONLY valid JSON matching "
                        "the required schema. Do not include any other text."
                    ),
                },
            ]

            try:
                retry_result = await self.complete(
                    messages=repair_messages,
                    step=step,
                    case_id=case_id,
                    response_format=response_format,
                )
                parsed_json = json.loads(retry_result["content"])
                parsed = response_model.model_validate(parsed_json)

                # Mark the original call_log
                result["call_log"].structured_output_valid = False

                return {
                    "parsed": parsed,
                    "raw_content": retry_result["content"],
                    "call_log": retry_result["call_log"],
                }

            except Exception as retry_error:
                result["call_log"].structured_output_valid = False
                logger.error(
                    "structured_output_repair_failed",
                    extra={
                        "step": step,
                        "case_id": case_id,
                        "error": str(retry_error),
                    },
                )
                raise RuntimeError(
                    f"Failed to parse structured output for step '{step}' "
                    f"after repair attempt: {retry_error}"
                )

    # ----- Utilities --------------------------------------------------------

    @property
    def call_logs(self) -> List[LLMCallLog]:
        """Access recorded call logs (for persistence to DB)."""
        return self._call_logs

    def clear_logs(self) -> None:
        """Clear in-memory call logs after persisting."""
        self._call_logs.clear()

    @property
    def daily_cost(self) -> float:
        """Current day's cumulative cost in USD."""
        return _cost_tracker.total_usd_today
