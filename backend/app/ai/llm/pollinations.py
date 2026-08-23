"""
Pollinations AI integration for zero-auth, resilient AI inference fallback.
"""

import logging
import urllib.parse
import urllib.request

logger = logging.getLogger(__name__)


def call_pollinations_ai(prompt: str, system_prompt: str = "", timeout: float = 1.0) -> str:
    """
    Calls the text.pollinations.ai service with fast timeout and exception handling.
    Returns response text or empty string on failure.
    """
    try:
        full_prompt = f"{system_prompt}\n\nUser Query: {prompt}" if system_prompt else prompt
        if len(full_prompt) > 800:
            full_prompt = full_prompt[:800]

        encoded_prompt = urllib.parse.quote(full_prompt)
        url = f"https://text.pollinations.ai/{encoded_prompt}?json=true"

        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) NyayaSaathi/1.0",
                "Accept": "application/json, text/plain, */*",
            },
        )
        with urllib.request.urlopen(req, timeout=timeout) as response:
            res_text = response.read().decode("utf-8").strip()
            if res_text and not res_text.startswith("Error") and "Payment Required" not in res_text:
                return res_text
            return ""
    except Exception as e:
        logger.warning("Pollinations AI text fallback skipped (%s)", e)
        return ""
