import asyncio
import sys
import logging
from app.ai.llm.client import LLMClient
from app.core.config import settings

logging.basicConfig(level=logging.INFO)

async def test_llm():
    print(f"Testing with API Key from settings: {settings.OPENAI_API_KEY}")
    print(f"Testing with API Key from OS Env: {__import__('os').getenv('OPENAI_API_KEY')}")
    
    client = LLMClient(max_retries=1) # minimize retries for quick testing
    
    try:
        print("\nAttempting to call OpenAI...")
        result = await client.complete(
            messages=[{"role": "user", "content": "Say 'hello world'"}],
        )
        print("\nSUCCESS! The LLM responded:")
        print(result["content"])
    except Exception as e:
        print(f"\nFAILED to complete LLM call! Error:\n{type(e).__name__}: {e}")

if __name__ == "__main__":
    asyncio.run(test_llm())
