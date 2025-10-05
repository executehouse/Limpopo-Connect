"""
Example: Business Description Generator

This script demonstrates how to use the AI integration to generate
engaging descriptions for businesses in the Limpopo Connect directory.
"""

import os
from ai_inference import AIInferenceClient


def generate_business_description(business_name: str, business_type: str, location: str) -> str:
    """
    Generate an engaging business description using AI.
    
    Args:
        business_name: Name of the business
        business_type: Type of business (e.g., restaurant, hotel, shop)
        location: Location in Limpopo Province
    
    Returns:
        Generated description
    """
    system_message = """You are a creative copywriter specializing in business descriptions 
for a local directory in Limpopo Province, South Africa. Create engaging, concise 
descriptions that highlight what makes each business special. Keep descriptions to 
2-3 sentences."""
    
    user_message = f"""Generate a compelling business description for:
Business Name: {business_name}
Type: {business_type}
Location: {location}, Limpopo Province

Include what makes this business special and why locals should visit."""

    try:
        client = AIInferenceClient()
        return client.get_response(user_message, system_message)
    except ValueError as e:
        return f"Error: {e}"


def main():
    """Run example business description generation."""
    print("=" * 70)
    print("Business Description Generator - Limpopo Connect AI Integration")
    print("=" * 70)
    print()
    
    # Example businesses
    examples = [
        {
            "name": "Mokopane Craft Market",
            "type": "Craft Market",
            "location": "Mokopane"
        },
        {
            "name": "Baobab Country Lodge",
            "type": "Lodge",
            "location": "Musina"
        },
        {
            "name": "Letaba Restaurant",
            "type": "Restaurant",
            "location": "Tzaneen"
        }
    ]
    
    for business in examples:
        print(f"Business: {business['name']}")
        print(f"Type: {business['type']}")
        print(f"Location: {business['location']}")
        print()
        print("Generated Description:")
        
        description = generate_business_description(
            business['name'],
            business['type'],
            business['location']
        )
        
        print(description)
        print()
        print("-" * 70)
        print()


if __name__ == "__main__":
    # Check if GITHUB_TOKEN is set
    if not os.environ.get("GITHUB_TOKEN"):
        print("⚠️  GITHUB_TOKEN environment variable not set!")
        print()
        print("This example requires a GitHub personal access token.")
        print("To run this example:")
        print()
        print("1. Generate a token at: https://github.com/settings/tokens")
        print("2. Set it: export GITHUB_TOKEN='your_token'")
        print("3. Run this script again")
        print()
        print("For now, here's what the output would look like:")
        print()
        print("=" * 70)
        print("Business: Mokopane Craft Market")
        print("Type: Craft Market")
        print("Location: Mokopane")
        print()
        print("Generated Description:")
        print("Mokopane Craft Market offers an authentic showcase of Limpopo's")
        print("rich artistic heritage, featuring handcrafted pottery, traditional")
        print("beadwork, and locally-made textiles. Visit to support local artisans")
        print("and take home unique pieces that tell the story of our vibrant culture.")
        print()
    else:
        main()
