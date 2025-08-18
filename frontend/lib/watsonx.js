const { IamAuthenticator } = require('ibm-cloud-sdk-core');
const { WatsonXAI } = require('@ibm-cloud/watsonx-ai');

let watsonxAI = null;

/**
 * Initialize Watson AI service
 */
function initializeWatsonx() {
  if (!watsonxAI) {
    // Create IAM authenticator explicitly
    const authenticator = new IamAuthenticator({
      apikey: process.env.WATSONX_API_KEY,
    });
    
    watsonxAI = new WatsonXAI({
      authenticator: authenticator,
      version: '2024-05-31',
      serviceUrl: process.env.WATSONX_URL,
    });
  }
  return watsonxAI;
}

/**
 * Ask Watsonx to generate text based on a prompt
 * @param {string} prompt - The prompt to send to Watsonx
 * @returns {Promise<string>} - The generated text response
 */
export async function askWatsonx(prompt) {
  try {
    // Check if credentials are properly set
    if (!process.env.WATSONX_API_KEY || process.env.WATSONX_API_KEY === 'your_watsonx_api_key_here') {
      console.warn('WATSONX_API_KEY not properly configured, using mock response');
      return generateMockResponse(prompt);
    }

    if (!process.env.WATSONX_PROJECT_ID || process.env.WATSONX_PROJECT_ID === 'your_project_id_here') {
      console.warn('WATSONX_PROJECT_ID not properly configured, using mock response');
      return generateMockResponse(prompt);
    }

    const watsonx = initializeWatsonx();
    
    const params = {
      input: prompt,
      modelId: 'ibm/granite-13b-chat-v2',
      projectId: process.env.WATSONX_PROJECT_ID,
      parameters: {
        max_new_tokens: 300,
        temperature: 0.7,
        stop_sequences: ['\n\n'],
        repetition_penalty: 1.1,
      },
    };

    console.log('Sending request to Watsonx with prompt:', prompt);
    
    const response = await watsonx.generateText(params);
    
    // Extract the generated text from the response
    const generatedText = response.result?.results?.[0]?.generated_text || '';
    
    console.log('Watsonx response:', generatedText);
    
    return generatedText.trim();
  } catch (error) {
    console.error('Error calling Watsonx:', error);
    console.warn('Falling back to mock response due to API error');
    return generateMockResponse(prompt);
  }
}

/**
 * Generate a mock response when Watsonx API is not available
 * @param {string} prompt - The original prompt
 * @returns {string} - Mock JSON response
 */
function generateMockResponse(prompt) {
  const mockMeals = [
    "Scrambled eggs with rice - A simple and nutritious meal using eggs and rice as the main ingredients.",
    "Chicken fried rice - Stir-fried rice with diced chicken, perfect for using leftover rice.",
    "Chicken and egg rice bowl - A Japanese-inspired donburi bowl with chicken and egg over rice."
  ];
  
  const mockShoppingList = [
    "Cooking oil",
    "Salt and pepper", 
    "Soy sauce",
    "Green onions",
    "Garlic"
  ];

  return JSON.stringify({
    meals: mockMeals,
    shoppingList: mockShoppingList
  });
}

/**
 * Parse JSON response from Watsonx, with fallback for malformed JSON
 * @param {string} text - The text response from Watsonx
 * @returns {Object} - Parsed JSON object or fallback structure
 */
export function parseWatsonxResponse(text) {
  try {
    // Try to find JSON in the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback: parse manually if JSON parsing fails
    return {
      meals: ['Unable to parse meal suggestions'],
      shoppingList: ['Check response format']
    };
  } catch (error) {
    console.error('Error parsing Watsonx response:', error);
    return {
      meals: ['Error parsing meal suggestions'],
      shoppingList: ['Please try again']
    };
  }
}
