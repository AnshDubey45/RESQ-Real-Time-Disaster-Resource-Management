# Backend Development & AWS Integration Guide

## 1. Project Structure
```
backend/
├─ app/
│   ├─ main.py                # FastAPI entry point (Mangum wrapper for Lambda)
│   ├─ core/
│   │   ├─ config.py          # Settings (pydantic BaseSettings)
│   │   ├─ security.py        # JWT utilities, password hashing
│   │   └─ database.py        # SQLAlchemy engine & session
│   ├─ models/                # SQLAlchemy ORM models (tables)
│   │   ├─ user.py
│   │   ├─ disaster.py
│   │   ├─ area.py
│   │   ├─ warehouse.py
│   │   ├─ resource.py
│   │   ├─ request.py
│   │   ├─ allocation.py
│   │   ├─ prediction.py
│   │   ├─ simulation.py
│   │   └─ audit_log.py
│   ├─ schemas/               # Pydantic request/response models
│   │   └─ *.py
│   ├─ routers/               # FastAPI APIRouter groups (auth, disasters, ...)
│   │   ├─ auth.py
│   │   ├─ disasters.py
│   │   ├─ areas.py
│   │   ├─ requests.py
│   │   ├─ warehouses.py
│   │   ├─ allocations.py
│   │   ├─ predictions.py
│   │   ├─ simulations.py
│   │   └─ audit.py
│   ├─ engines/               # Pure‑python business logic (no DB access)
│   │   ├─ priority.py
│   │   ├─ allocation.py
│   │   ├─ explanation.py
│   │   └─ simulation.py
│   └─ ml/                    # Light‑weight ML utilities
│       ├─ generate_data.py
│       ├─ train.py
│       ├─ predict.py
│       ├─ model.joblib
│       └─ model_meta.json
├─ tests/                     # pytest suite
│   ├─ conftest.py
│   ├─ test_auth.py
│   ├─ test_crud.py
│   ├─ test_engines.py
│   └─ test_ml.py
├─ requirements.txt
├─ template.yaml               # AWS SAM template (Lambda + RDS Proxy)
└─ seed.py                     # Idempotent data seeder
```

## 2. Core Boilerplate (what to create)

### `app/core/config.py`
```python
from pydantic import BaseSettings, Field
from typing import List

class Settings(BaseSettings):
    # ------------------- General -------------------
    ENV: str = Field(default="local", env="ENV")
    DEBUG: bool = Field(default=True, env="DEBUG")

    # ------------------- Database -------------------
    DATABASE_URL: str = Field(..., env="DATABASE_URL")  # e.g. postgresql://user:pw@host:5432/db
    # ------------------- Security -------------------
    JWT_SECRET: str = Field(..., env="JWT_SECRET")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ALGORITHM: str = "HS256"

    # ------------------- AWS (optional) -------------------
    S3_BUCKET: str = Field(default="", env="S3_BUCKET")
    MODEL_KEY: str = Field(default="model.joblib", env="MODEL_KEY")

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

### `app/core/database.py`
```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
```

### `app/core/security.py`
```python
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from .config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.ALGORITHM)

def decode_token(token: str):
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError as e:
        raise e
```

## 3. API Boilerplate

### `app/main.py`
```python
import os
from fastapi import FastAPI
from mangum import Mangum  # Lambda wrapper
from app.core.database import Base, engine
from app.routers import auth, disasters, areas, requests, warehouses, allocations, predictions, simulations, audit

app = FastAPI(title="RESQ‑CLOUD backend", version="1.0.0")

# Include routers (each router defines its prefix & tags)
app.include_router(auth.router)
app.include_router(disasters.router)
app.include_router(areas.router)
app.include_router(requests.router)
app.include_router(warehouses.router)
app.include_router(allocations.router)
app.include_router(predictions.router)
app.include_router(simulations.router)
app.include_router(audit.router)

# Create tables (only for local dev – in prod use Alembic migrations)
@app.on_event("startup")
async def startup():
    Base.metadata.create_all(bind=engine)

# Lambda handler (if deployed to AWS)
handler = Mangum(app)
```

## 4. Auth Router (`app/routers/auth.py`)
- `POST /auth/login` → returns JWT + role.
- `GET /auth/me` → current user info (protected).
- Use dependency `Depends(get_current_user)` that validates the token and loads the DB user.

## 5. CRUD Routers (example pattern)
Each router follows the same pattern:
```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models import disaster as model
from app.schemas import disaster as schema
from app.core.security import get_current_user

router = APIRouter(prefix="/disasters", tags=["Disasters"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[schema.DisasterOut])
async def list_disasters(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(model.Disaster).all()
```
Add role‑checks (`if user.role != "admin": raise HTTPException(..., 403)`).

## 6. Engines (pure functions, no DB)
- **priority.py** – implements the weighted formula from PRD (0.30*severity …).
- **allocation.py** – greedy, stock‑reserve respecting algorithm.
- **explanation.py** – builds the JSON structure with factor breakdown.
- **simulation.py** – clones current DB state (in‑memory copies) → runs engines → returns a snapshot without persisting.
All engines are unit‑tested in `tests/test_engines.py`.

## 7. ML Pipeline (`app/ml/`)
1. `generate_data.py` – creates synthetic training CSVs.
2. `train.py` – loads CSV, trains a `RandomForestRegressor`, stores `model.joblib` and `model_meta.json`.
3. `predict.py` – loads the model (cached) and exposes `predict(request: PredictionInput) -> PredictionResult`.

### Deployment note
- In AWS you will store `model.joblib` in an S3 bucket (free tier). The Lambda loads it at cold‑start using `boto3` (`s3.get_object`).
- Locally the model lives alongside the code.

## 8. Database Seeding (`seed.py`)
- Idempotent script that creates roles, demo users, 3 disasters, 8 areas, 4 warehouses, resource types, mock requests, etc.
- Run with `python -m backend.seed` after the DB is provisioned.

## 9. Testing & CI (GitHub Actions)
Create `.github/workflows/ci.yml` (already referenced in PRD) that:
```yaml
name: CI
on: [push, pull_request]
jobs:
  backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - name: Install deps
        run: pip install -r requirements.txt
      - name: Run tests
        env:
          DATABASE_URL: sqlite:///test.db
          JWT_SECRET: secret
        run: pytest -q
```
Add a second job for the frontend (already present).

## 10. AWS Production Architecture (free‑tier friendly)
| Service | Role | Free‑tier notes |
|---|---|---|
| **API Gateway** | HTTP entry point for the FastAPI Lambda | 1 M req/mo free |
| **Lambda** | Runs the FastAPI app (via Mangum) | 1 M req/mo, 400 k GB‑sec free |
| **RDS (PostgreSQL) – Free‑tier** | Primary relational store | 750 h/mo (≈ 1 instance) – good for dev/demo |
| **RDS Proxy** (optional) | Keeps DB connections warm for Lambda | Free tier included with RDS usage |
| **S3** | Stores the ML model artifact & optional static assets | 5 GB storage free |
| **IAM** | Roles & policies for Lambda ↔ RDS, S3 | No cost |
| **CloudWatch Logs** | Lambda logs, health metrics | 5 GB ingestion free |
| **Secrets Manager** (or Parameter Store) | Holds `JWT_SECRET`, DB credentials | First 30 secrets free |

### Step‑by‑step AWS Deployment
1. **Create an AWS account** (set billing alarm ≤ $0). Enable the free‑tier services.
2. **Provision an RDS PostgreSQL instance**
   ```bash
   aws rds create-db-instance \
     --db-instance-identifier resq-db \
     --engine postgres \
     --db-instance-class db.t3.micro \
     --allocated-storage 20 \
     --master-username admin \
     --master-user-password <your‑password> \
     --backup-retention-period 7 \
     --no-multi-az \
     --publicly-accessible
   ```
   Record the endpoint URL; it becomes `DATABASE_URL`.
3. **Create an S3 bucket** (e.g. `resq-models-<your‑id>`). Upload `model.joblib` and `model_meta.json`.
4. **Store secrets** (using Parameter Store for simplicity):
   ```bash
   aws ssm put-parameter --name /resq/jwt_secret --value <random‑hex> --type SecureString
   aws ssm put-parameter --name /resq/database_url --value "postgresql://admin:<pw>@<endpoint>:5432/resq" --type SecureString
   ```
5. **Build the Lambda package** (including the `app/` folder and dependencies). Use **AWS SAM** or **Serverless Framework** – the repo already has `template.yaml` (SAM). Example SAM build:
   ```bash
   sam build --template-file backend/template.yaml
   sam deploy \
     --stack-name resq-backend \
     --s3-bucket <your‑s3‑bucket> \
     --parameter-overrides \
        JWTSecret=$(aws ssm get-parameter --name /resq/jwt_secret --query Parameter.Value --output text) \
        DatabaseUrl=$(aws ssm get-parameter --name /resq/database_url --query Parameter.Value --output text) \
        ModelBucket=$(aws ssm get-parameter --name /resq/model_bucket --query Parameter.Value --output text) \
     --capabilities CAPABILITY_IAM
   ```
   The SAM template creates:
   - `AWS::Serverless::Function` (FastAPI Lambda)
   - `AWS::Serverless::Api` (API Gateway)
   - IAM role that grants `secretsmanager:GetSecretValue` and `s3:GetObject`.
6. **Configure CORS** in the API Gateway to allow the frontend origin (e.g. `https://<your‑frontend>.netlify.app`).
7. **Add a health endpoint** (`GET /health`) that checks DB connectivity and model load; the UI already expects it.
8. **Deploy the frontend** to a free static host (Vercel/Netlify). Set the environment variable `VITE_API_URL` to the API‑Gateway invoke URL.
9. **Test the live stack** – run a few end‑to‑end API calls (login, create request, run a simulation). Verify CloudWatch logs show no errors.

## 11. What still needs **your** input
| Item | Why you need to act | How to act |
|---|---|---|
| **AWS Account & billing alerts** | Prevent accidental spend. | Create billing alarm in the AWS console (`$0` threshold). |
| **RDS credentials** | Backend needs a DB connection string. | Store the `DATABASE_URL` in Parameter Store (or `.env` for local dev). |
| **JWT secret** | Used for token signing; must stay secret. | Generate a random 32‑byte hex (`openssl rand -hex 32`) and store it as a SecureString. |
| **S3 bucket name** | Model file will be loaded from S3 at runtime. | Create the bucket, upload `model.joblib` and `model_meta.json`. |
| **Domain / CORS config** | Frontend must be allowed to call the API. | In the API‑Gateway console, add the frontend URL to the allowed origins. |
| **Optional: CodePipeline** | Automate deployment after each push. | Set up a GitHub Actions → SAM Deploy workflow (extend the existing CI file). |

## 12. Local Development Checklist
1. Install Python 3.12, create a virtualenv.
2. `pip install -r requirements.txt`.
3. Copy `.env.example` → `.env` and fill:
   ```
   DATABASE_URL=postgresql://postgres:password@localhost:5432/resq
   JWT_SECRET=super‑secret-key
   ```
4. Run `python -m backend.seed` to populate the local DB.
5. Start the server: `uvicorn app.main:app --reload`.
6. Open `http://localhost:8000/docs` – Swagger UI should list all endpoints.
7. Run the test suite: `pytest` (all should pass).
8. When you’re happy, push to GitHub – CI will run and, if you enabled the SAM deploy job, will push to AWS automatically.

---
**Next steps for you**: pick a folder (`backend/app/...`) and start creating the files listed in sections 2‑6. The skeleton above covers everything the PRD expects. Once the core crud & auth are up, implement the engines and ML pipeline, then move on to AWS deployment.

*Feel free to ask for any concrete file content or further clarification on a particular step.*
