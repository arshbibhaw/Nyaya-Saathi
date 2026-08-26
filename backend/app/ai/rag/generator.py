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
    import asyncio
    from app.ai.llm.client import LLMClient
    
    client = LLMClient()
    
    context_str = "\n\n".join(
        f"[Source: {c.get('title', 'Unknown')}]\n{c.get('chunk_text', '')}" 
        for c in context
    )
    
    messages = [
        {"role": "system", "content": GENERATOR_PROMPT.format(context=context_str)},
    ]
    
    messages.extend(case_history)
    messages.append({"role": "user", "content": query})
    
    try:
        response_data = asyncio.run(client.complete(
            messages=messages,
            step="rag_generation"
        ))
        return response_data["content"]
    except Exception as e:
        return f"I encountered an error while trying to process your request: {e}"


def generate_response_stream(
    query: str,
    context: list[dict],
    case_history: list[dict],
):
    """
    Stream AI response chunks grounded in legal context.
    """
    response_text = generate_response(query, context, case_history)
    # Stream in small words/tokens for SSE
    words = response_text.split(" ")
    for i, word in enumerate(words):
        yield word + (" " if i < len(words) - 1 else "")

