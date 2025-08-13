import os, json
from dotenv import load_dotenv
from ibm_watsonx_ai.foundation_models import Model
from ibm_watsonx_ai import Credentials

load_dotenv()

WATSONX_API_KEY = os.getenv("WATSONX_API_KEY")
WATSONX_URL = os.getenv("WATSONX_URL", "https://us-south.ml.cloud.ibm.com")
WATSONX_PROJECT_ID = os.getenv("WATSONX_PROJECT_ID")
MODEL_ID = os.getenv("MODEL_ID", "ibm/granite-13b-chat-v2")

def generate_recipe_with_watsonx(pantry_items):
    if not WATSONX_API_KEY:
        return {"title": "Fallback Recipe", "body": "Missing WATSONX_API_KEY", "missing": []}

    prompt = f"""You are an expert home cook. Using ONLY these pantry items if possible:
{', '.join(pantry_items) if pantry_items else 'none'}.

Return a SINGLE recipe as JSON with keys: title (string), body (string steps), ingredients (array of ingredient names), missing (array of ingredient names not in pantry but recommended). Keep it concise.
Example:
{{"title":"Tomato Lentil Rice","body":"1) ... 2) ...","ingredients":["rice","lentils","tomato"],"missing":["onion"]}}
"""

    creds = Credentials(url=WATSONX_URL, api_key=WATSONX_API_KEY)
    model = Model(
        model_id=MODEL_ID,
        params={
            "decoding_method":"greedy",
            "max_new_tokens": 400,
            "temperature": 0.3,
            "repetition_penalty":1.05
        },
        credentials=creds,
        project_id=WATSONX_PROJECT_ID
    )

    raw = model.generate_text(prompt=prompt)
    # raw is usually a string
    try:
        data = json.loads(raw)
    except Exception:
        # best-effort extraction
        data = {"title":"AI Recipe", "body": str(raw), "ingredients": [], "missing": []}

    # Guarantee fields
    data.setdefault("title", "AI Recipe")
    data.setdefault("body", "")
    data.setdefault("ingredients", [])
    data.setdefault("missing", [])
    return data
