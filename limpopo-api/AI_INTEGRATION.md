# Azure AI Inference Integration

This directory contains the Azure AI Inference integration for Limpopo Connect, enabling AI-powered features using GitHub Models.

## Overview

The `ai_inference.py` module provides a simple interface to interact with OpenAI models via GitHub's Azure AI Inference endpoint. This integration allows you to:

- Query AI models for intelligent responses
- Integrate AI capabilities into your Limpopo Connect features
- Use GitHub Models for free (with rate limits) for development and testing

## Requirements

- Python 3.12+
- Azure AI Inference SDK
- GitHub Personal Access Token

## Installation

1. **Install Python dependencies:**
   ```bash
   cd limpopo-api
   pip install -r requirements.txt
   ```

2. **Set up your GitHub Token:**
   
   Create a GitHub personal access token at: https://github.com/settings/tokens
   
   The token needs the following permissions:
   - No specific scopes required for GitHub Models access
   
   Set the token as an environment variable:
   ```bash
   export GITHUB_TOKEN="your_github_personal_access_token"
   ```
   
   Or add it to your `.env` file:
   ```env
   GITHUB_TOKEN=your_github_personal_access_token
   ```

## Usage

### Command Line

Run the example script:
```bash
python ai_inference.py
```

This will execute a simple query demonstrating the AI integration.

### In Your Code

Import and use the AI client in your Python code:

```python
from ai_inference import AIInferenceClient, get_ai_response

# Quick usage with convenience function
response = get_ai_response("What is the capital of France?")
print(response)

# Or use the client class for more control
ai_client = AIInferenceClient()
response = ai_client.get_response(
    user_message="What is the capital of France?",
    system_message="You are a helpful assistant specialized in geography."
)
print(response)
```

## Configuration

The AI client can be configured with the following parameters:

- **endpoint**: The GitHub Models inference endpoint (default: `https://models.github.ai/inference`)
- **model**: The AI model to use (default: `openai/gpt-5`)
- **token**: Your GitHub personal access token (from `GITHUB_TOKEN` environment variable)

## Example Use Cases for Limpopo Connect

Here are some potential use cases for AI integration in Limpopo Connect:

1. **Business Recommendations**: Help users find relevant businesses based on natural language queries
2. **Event Suggestions**: Provide personalized event recommendations
3. **Content Generation**: Generate descriptions for businesses or events
4. **FAQ Chatbot**: Answer common questions about the Limpopo region
5. **Translation**: Translate content between local languages
6. **Content Summarization**: Summarize long business descriptions or event details

## Error Handling

The module includes comprehensive error handling:

- Missing `GITHUB_TOKEN`: Clear error message with setup instructions
- API errors: Graceful error handling with informative messages
- Network issues: Proper exception handling

## Rate Limits

GitHub Models has rate limits for free usage. For production use, consider:

- Implementing caching for common queries
- Using rate limiting in your application
- Monitoring your usage

## Security Notes

- **Never commit your `GITHUB_TOKEN` to version control**
- Store tokens securely in environment variables or Azure Key Vault
- Use separate tokens for development and production
- Regularly rotate your tokens

## Troubleshooting

### "GITHUB_TOKEN environment variable is not set"

Make sure you've set the token:
```bash
export GITHUB_TOKEN="your_token"
```

### "Error getting AI response"

Check:
1. Your token is valid and hasn't expired
2. You have internet connectivity
3. The GitHub Models API is available
4. You haven't exceeded rate limits

## Further Development

To integrate this into Azure Functions (TypeScript/Node.js), consider:

1. Creating a Python Azure Function that wraps this client
2. Using subprocess to call the Python script from Node.js
3. Creating a REST API endpoint that accepts prompts and returns AI responses
4. Implementing caching with Redis or Azure Cache

## Resources

- [GitHub Models Documentation](https://github.com/marketplace/models)
- [Azure AI Inference SDK](https://github.com/Azure/azure-sdk-for-python/tree/main/sdk/ai/azure-ai-inference)
- [OpenAI Models](https://platform.openai.com/docs/models)

## License

This integration follows the same license as the Limpopo Connect project.
