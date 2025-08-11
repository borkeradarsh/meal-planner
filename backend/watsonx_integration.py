"""
IBM watsonx AI Integration Module
This module provides integration with IBM watsonx AI for generating meal plans.

To use this module:
1. Set up your IBM Cloud credentials
2. Install ibm-watsonx-ai package 
3. Configure environment variables in .env:
   - WATSONX_API_KEY
   - WATSONX_URL  
   - WATSONX_PROJECT_ID
4. Set USE_WATSONX=true in .env
"""

import os
from typing import List, Dict, Any

def generate_recipe_with_watsonx(pantry_items: List[str]) -> Dict[str, Any]:
    """
    Generate a recipe using IBM watsonx AI based on available pantry items.
    
    Args:
        pantry_items: List of available ingredients in the pantry
        
    Returns:
        Dictionary containing recipe title, body, and missing ingredients
    """
    
    # Check if environment variables are set
    api_key = os.getenv("WATSONX_API_KEY")
    url = os.getenv("WATSONX_URL")
    project_id = os.getenv("WATSONX_PROJECT_ID")
    
    if not all([api_key, url, project_id]):
        return {
            "title": "Configuration Error",
            "body": "IBM watsonx credentials are not properly configured. Please check your .env file.",
            "missing": []
        }
    
    try:
        # Import IBM watsonx AI SDK
        from ibm_watsonx_ai import Credentials
        from ibm_watsonx_ai.foundation_models import Model
        
        # Set up credentials
        credentials = Credentials(
            url=url,
            api_key=api_key
        )
        
        # Create a prompt for meal planning
        ingredients_text = ", ".join(pantry_items)
        prompt = f"""
You are a professional chef AI assistant. Based on the following available ingredients, create a practical and delicious recipe.

Available ingredients: {ingredients_text}

Please provide:
1. A creative recipe title
2. Step-by-step cooking instructions
3. List any missing essential ingredients needed (if any)

Format your response as a JSON with: title, instructions, and missing_ingredients.
"""
        
        # Configure the model
        model = Model(
            model_id="meta-llama/llama-2-70b-chat",  # You can change this to your preferred model
            params={
                "decoding_method": "greedy",
                "max_new_tokens": 500,
                "temperature": 0.7
            },
            credentials=credentials,
            project_id=project_id
        )
        
        # Generate the response
        response = model.generate_text(prompt)
        
        # Parse the response (this is a simplified version)
        # In production, you would want more robust JSON parsing
        return {
            "title": "AI-Generated Recipe",
            "body": response,
            "missing": []  # Extract this from the AI response
        }
        
    except ImportError:
        return {
            "title": "Import Error",
            "body": "IBM watsonx AI SDK is not installed. Please install it using: pip install ibm-watsonx-ai",
            "missing": []
        }
    except Exception as e:
        return {
            "title": "WatsonX Error",
            "body": f"Error connecting to IBM watsonx AI: {str(e)}",
            "missing": []
        }


def test_watsonx_connection() -> bool:
    """
    Test the connection to IBM watsonx AI.
    
    Returns:
        True if connection is successful, False otherwise
    """
    try:
        # Test with a simple ingredient list
        result = generate_recipe_with_watsonx(["chicken", "rice", "vegetables"])
        return "Error" not in result.get("title", "")
    except:
        return False


if __name__ == "__main__":
    # Test the integration
    print("Testing IBM watsonx AI integration...")
    
    if test_watsonx_connection():
        print("✅ Connection successful!")
    else:
        print("❌ Connection failed. Please check your configuration.")
    
    # Example usage
    sample_ingredients = ["chicken breast", "rice", "broccoli", "soy sauce"]
    result = generate_recipe_with_watsonx(sample_ingredients)
    
    print(f"\nSample Recipe: {result['title']}")
    print(f"Instructions: {result['body']}")
    if result['missing']:
        print(f"Missing ingredients: {', '.join(result['missing'])}")
