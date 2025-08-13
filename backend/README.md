# Backend — Flask + SQLite + IBM watsonx

## Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # fill values; keep USE_WATSONX=false first
python init_db.py
python app.py
```
API base: `http://localhost:5000`

## Env vars
- `USE_WATSONX` = `true` or `false`
- `WATSONX_API_KEY`, `WATSONX_URL`, `WATSONX_PROJECT_ID`, `MODEL_ID`

## Key endpoints
- `GET /health`
- `GET /pantry`
- `POST /pantry` `{name, quantity, unit}`
- `DELETE /pantry/:id`
- `POST /plan-meal` `{pantry?: string[]}` → `{title, body, ingredients[], missing[]}`
- `POST /shopping-list` `{ingredients: string[]}` → `{missing: string[]}`
