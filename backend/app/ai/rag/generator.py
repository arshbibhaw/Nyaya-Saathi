"""
RAG response generator stub.

Takes the user query, retrieved legal context, and conversation history,
then calls the LLM to produce a grounded response.
"""

from app.ai.prompts.templates import GENERATOR_PROMPT


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

    .. note::
        **STUB** — returns a placeholder response.  Replace with an
        actual LLM call.  Use ``GENERATOR_PROMPT`` as the system
        message and inject *context* into the prompt.
    """
    # TODO: Replace with actual LLM call
    #
    # from openai import OpenAI
    # from app.core.config import settings
    #
    # client = OpenAI(api_key=settings.LLM_API_KEY)
    #
    # context_str = "\n\n".join(
    #     f"[Source: {c['title']}]\n{c['chunk_text']}" for c in context
    # )
    #
    # messages = [
    #     {"role": "system", "content": GENERATOR_PROMPT.format(context=context_str)},
    #     *case_history,
    #     {"role": "user", "content": query},
    # ]
    #
    # response = client.chat.completions.create(
    #     model=settings.LLM_MODEL,
    #     messages=messages,
    # )
    # return response.choices[0].message.content

    if context:
        sources_text = ", ".join(c.get("title", "Unknown") for c in context)
        return (
            f"Based on your query, I found relevant information from: {sources_text}. "
            f"[This is a placeholder response. The AI teammate should implement "
            f"the actual LLM call in app/ai/rag/generator.py]"
        )

    return (
        "Thank you for sharing the details of your situation. "
        "I understand this can be stressful. Let me help you understand your options. "
        "[This is a placeholder response. The AI teammate should implement "
        "the actual LLM call in app/ai/rag/generator.py]"
    )
