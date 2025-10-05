"""
Test script for AI Inference integration

This script tests the AI inference module without requiring a real GitHub token.
It verifies that:
1. The module imports correctly
2. Error handling works as expected
3. The client initializes properly with a test token
"""

import os
import sys

# Add the limpopo-api directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test that all required modules can be imported."""
    print("Testing imports...")
    try:
        from ai_inference import AIInferenceClient, get_ai_response
        print("✓ Successfully imported ai_inference module")
        return True
    except ImportError as e:
        print(f"✗ Failed to import: {e}")
        return False

def test_error_handling():
    """Test error handling when GITHUB_TOKEN is not set."""
    print("\nTesting error handling...")
    # Make sure GITHUB_TOKEN is not set
    if "GITHUB_TOKEN" in os.environ:
        del os.environ["GITHUB_TOKEN"]
    
    try:
        from ai_inference import AIInferenceClient
        try:
            client = AIInferenceClient()
            print("✗ Should have raised ValueError for missing token")
            return False
        except ValueError as e:
            if "GITHUB_TOKEN" in str(e):
                print(f"✓ Correctly raised ValueError: {e}")
                return True
            else:
                print(f"✗ Wrong error message: {e}")
                return False
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
        return False

def test_initialization_with_token():
    """Test that client initializes with a test token."""
    print("\nTesting initialization with token...")
    os.environ["GITHUB_TOKEN"] = "test_token_12345"
    
    try:
        from ai_inference import AIInferenceClient
        client = AIInferenceClient()
        
        if client.endpoint == "https://models.github.ai/inference":
            print("✓ Client initialized with correct endpoint")
        else:
            print(f"✗ Wrong endpoint: {client.endpoint}")
            return False
        
        if client.model == "openai/gpt-5":
            print("✓ Client initialized with correct model")
        else:
            print(f"✗ Wrong model: {client.model}")
            return False
        
        return True
    except Exception as e:
        print(f"✗ Failed to initialize client: {e}")
        return False
    finally:
        # Clean up
        if "GITHUB_TOKEN" in os.environ:
            del os.environ["GITHUB_TOKEN"]

def main():
    """Run all tests."""
    print("=" * 60)
    print("AI Inference Integration Tests")
    print("=" * 60)
    print()
    
    tests = [
        ("Import Test", test_imports),
        ("Error Handling Test", test_error_handling),
        ("Initialization Test", test_initialization_with_token),
    ]
    
    results = []
    for test_name, test_func in tests:
        result = test_func()
        results.append((test_name, result))
    
    print("\n" + "=" * 60)
    print("Test Results Summary")
    print("=" * 60)
    
    for test_name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {test_name}")
    
    all_passed = all(result for _, result in results)
    
    print()
    if all_passed:
        print("✓ All tests passed!")
        return 0
    else:
        print("✗ Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())
