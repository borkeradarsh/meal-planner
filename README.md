# Pantry AI — Meal Planner MVP

Features:
- Pantry Management (add/update/delete items with quantities & units)
- AI Meal Planning (watsonx, toggleable)
- Smart Shopping List (missing ingredients)
- Tailwind CSS modern UI + Dark mode
- Flask backend + SQLite (switchable to Postgres later)

## Quickstart
### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # fill values; keep USE_WATSONX=false to test mock
python init_db.py
python app.py              # http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_BASE=http://localhost:5000" > .env.local
npm run dev                # http://localhost:3000
```

## Switch on IBM watsonx
1) In `backend/.env`, set `USE_WATSONX=true` and add:
```
WATSONX_API_KEY=your_key
WATSONX_URL=https://<your-region>.ml.cloud.ibm.com
WATSONX_PROJECT_ID=your_project_id
MODEL_ID=ibm/granite-13b-chat-v2
```
2) Restart backend. The `/plan-meal` route now uses Watsonx.

## Endpoints
- `GET /health`
- `GET /pantry`
- `POST /pantry` `{name, quantity, unit}`
- `DELETE /pantry/:id`
- `POST /plan-meal` `{pantry?: string[]}` → `{title, body, ingredients[], missing[]}`
- `POST /shopping-list` `{ingredients: string[]}` → `{missing: string[]}`
