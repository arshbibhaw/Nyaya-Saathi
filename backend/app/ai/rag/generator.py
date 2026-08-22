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
    import os
    from openai import OpenAI
    
    # Simple synchronous OpenAI client
    api_key = os.getenv("LLM_API_KEY", os.getenv("OPENAI_API_KEY"))
    
    if not api_key:
        return "System error: LLM_API_KEY environment variable is not configured."

    client = OpenAI(api_key=api_key)
    
    context_str = "\n\n".join(
        f"[Source: {c.get('title', 'Unknown')}]\n{c.get('chunk_text', '')}" 
        for c in context
    )
    
    messages = [
        {"role": "system", "content": GENERATOR_PROMPT.format(context=context_str)},
    ]
    
    # Append case history
    messages.extend(case_history)
    
    # Append current user query
    messages.append({"role": "user", "content": query})
    
    try:
        response = client.chat.completions.create(
            model=os.getenv("LLM_MODEL", "gpt-4o-mini"),
            messages=messages,
            temperature=0.3,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"I encountered an error while trying to process your request: {e}"
