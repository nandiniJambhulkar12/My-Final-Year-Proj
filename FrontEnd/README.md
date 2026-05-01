# XAI-Powered Code Compliance Auditor

Production-grade backend for "XAI-Powered Code Compliance Auditor for Enterprise Software Development".

Overview
- FastAPI backend that accepts code uploads and returns hybrid (static+ML) audit results with XAI explanations.
- Static analysis: Bandit + Semgrep
- ML: CodeBERT/DCodeBERT fine-tune (HuggingFace Transformers)
- XAI: SHAP token/line-level explanations
- DB: PostgreSQL (fallback SQLite)
- Containerized with Docker + docker-compose

Quick start (development)
1. Copy your provided dataset CSV into `./datasets/provided_dataset.csv`.
2. Build and run with Docker Compose (recommended):

```bash
docker-compose build
docker-compose up -d
```

3. Train model (optional; can be run locally before containerizing):

```bash
python backend/train.py --dataset datasets/provided_dataset.csv --output-dir backend/models/artifacts
```

4. API endpoints (default: `http://localhost:8000`):
- `POST /api/analyze` - accept a file upload or JSON with `code` and `language`.
- `GET /api/reports/{id}` - fetch stored report JSON.

Project structure
- `backend/` - backend service (FastAPI)
- `datasets/` - place provided dataset here as `provided_dataset.csv`
- `docs/` - architecture and XAI docs
- `docker-compose.yml` - Postgres + backend

Requirements
- Python 3.10+
- Docker (for Compose)

Contact
- For further integration with your React frontend, the `/api/analyze` endpoint returns JSON compatible with the frontend schema described in the project notes.
