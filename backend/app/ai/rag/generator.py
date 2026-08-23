"""
RAG response generator — uses LLMClient to produce grounded legal responses.

Takes the user query, retrieved legal context, and conversation history,
then calls the LLM to produce a grounded response.
"""

import asyncio
import concurrent.futures
import logging

from app.ai.llm.client import LLMClient
from app.ai.prompts.templates import GENERATOR_PROMPT

logger = logging.getLogger(__name__)


def generate_response(
    query: str,
    context: list[dict],
    case_history: list[dict],
) -> str:
    """
    Generate an AI response grounded in the retrieved legal context.

    Parameters
    ----------
    query : str
        The latest user message.
    context : list[dict]
        Retrieved legal source chunks from the retriever.
    case_history : list[dict]
        Previous messages in the conversation (``[{"role": ..., "content": ...}]``).

    Returns
    -------
    str
        The AI's response text.
    """
    client = LLMClient()

    context_str = "\n\n".join(
        f"[Source: {c.get('title', 'Unknown')}]\n{c.get('chunk_text', '')}"
        for c in context
    ) if context else "No specific legal sources available. Respond based on general Indian legal knowledge."

    messages = [
        {"role": "system", "content": GENERATOR_PROMPT.format(context=context_str)},
    ]

    # Add conversation history
    messages.extend(case_history[-10:])  # Keep last 10 messages for context window
    messages.append({"role": "user", "content": query})

    async def _generate():
        result = await client.complete(messages=messages, step="chat_response")
        return result["content"]

    # Handle being called from within an existing event loop (uvicorn)
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        with concurrent.futures.ThreadPoolExecutor() as pool:
            future = pool.submit(asyncio.run, _generate())
            return future.result(timeout=120)
    else:
        return asyncio.run(_generate())


def generate_response_stream(
    query: str,
    context: list[dict],
    case_history: list[dict],
):
    """
    Generate an AI response and yield it in chunks for SSE streaming.

    Since the Google GenAI SDK doesn't easily support token-level streaming
    in the same way as OpenAI, we generate the full response and yield it
    in word-level chunks to simulate streaming.
    """
    try:
        full_response = generate_response(query, context, case_history)

        # Yield in word-level chunks to simulate streaming
        words = full_response.split(" ")
        for i, word in enumerate(words):
            chunk = word if i == 0 else " " + word
            yield chunk
    except Exception as e:
        logger.error("Chat generation failed: %s", e)
        yield f"I apologize, but I encountered an error processing your request. Please try again."
