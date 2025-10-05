"""
Azure AI Inference Integration for Limpopo Connect

This module provides AI capabilities using GitHub Models (Azure AI Inference).
It uses the azure-ai-inference package to interact with OpenAI models via GitHub's inference endpoint.

Requirements:
    - azure-ai-inference>=1.0.0b5
    - azure-core>=1.30.0
    - GITHUB_TOKEN environment variable set with a valid GitHub personal access token

Usage:
    1. Set your GITHUB_TOKEN environment variable:
       export GITHUB_TOKEN="your_github_personal_access_token"
    
    2. Run the script:
       python ai_inference.py
    
    3. Or import and use in your code:
       from ai_inference import get_ai_response
       response = get_ai_response("What is the capital of France?")
"""

import os
import sys
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential


class AIInferenceClient:
    """Wrapper class for Azure AI Inference client."""
    
    def __init__(self, endpoint: str = "https://models.github.ai/inference", 
                 model: str = "openai/gpt-5"):
        """
        Initialize the AI Inference client.
        
        Args:
            endpoint: The GitHub Models inference endpoint
            model: The model to use (default: openai/gpt-5)
        """
        # Check if GITHUB_TOKEN is set
        self.token = os.environ.get("GITHUB_TOKEN")
        if not self.token:
            raise ValueError(
                "GITHUB_TOKEN environment variable is not set. "
                "Please set it with: export GITHUB_TOKEN='your_token'"
            )
        
        self.endpoint = endpoint
        self.model = model
        
        # Initialize the client
        self.client = ChatCompletionsClient(
            endpoint=self.endpoint,
            credential=AzureKeyCredential(self.token),
        )
    
    def get_response(self, user_message: str, system_message: str = "You are a helpful assistant.") -> str:
        """
        Get a response from the AI model.
        
        Args:
            user_message: The user's question or prompt
            system_message: System instructions for the AI (default: "You are a helpful assistant.")
        
        Returns:
            The AI's response as a string
        """
        try:
            response = self.client.complete(
                messages=[
                    SystemMessage(system_message),
                    UserMessage(user_message),
                ],
                model=self.model
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error getting AI response: {str(e)}"


def get_ai_response(user_message: str, system_message: str = "You are a helpful assistant.") -> str:
    """
    Convenience function to get an AI response.
    
    Args:
        user_message: The user's question or prompt
        system_message: System instructions for the AI
    
    Returns:
        The AI's response as a string
    """
    client = AIInferenceClient()
    return client.get_response(user_message, system_message)


def main():
    """Main function demonstrating the AI inference integration."""
    print("=" * 60)
    print("Azure AI Inference Integration for Limpopo Connect")
    print("=" * 60)
    print()
    
    try:
        # Initialize the client
        ai_client = AIInferenceClient()
        print(f"✓ Successfully initialized AI client")
        print(f"  Endpoint: {ai_client.endpoint}")
        print(f"  Model: {ai_client.model}")
        print()
        
        # Example usage
        print("Example Query:")
        question = "What is the capital of France?"
        print(f"Q: {question}")
        print()
        
        print("AI Response:")
        response = ai_client.get_response(question)
        print(f"A: {response}")
        print()
        
        print("=" * 60)
        print("Integration test completed successfully!")
        print("=" * 60)
        
    except ValueError as e:
        print(f"✗ Configuration Error: {e}")
        print()
        print("Please set your GITHUB_TOKEN environment variable:")
        print("  export GITHUB_TOKEN='your_github_personal_access_token'")
        print()
        print("You can generate a token at: https://github.com/settings/tokens")
        sys.exit(1)
    except Exception as e:
        print(f"✗ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()

