# RESQ-CLOUD 🌐⚡

**Real-Time Disaster Resource Intelligence & Allocation Platform**

RESQ-CLOUD is a mission-critical, cloud-native application designed to manage, prioritize, and intelligently allocate disaster relief resources across affected areas. Built with a 100% serverless event-driven architecture, it provides command centers with real-time analytics, AI-driven demand prediction, and automated supply chain logistics to maximize response efficiency during critical emergencies.

---

## 🚀 Key Features

* **Serverless Architecture:** Highly scalable and maintenance-free backend utilizing AWS API Gateway, Lambda, and DynamoDB.
* **AI Prioritization Engine:** Evaluates affected areas in real-time based on severity, population, medical urgency, and accessibility to dynamically calculate priority scores.
* **Smart Resource Allocation:** AI recommends optimal dispatch routes from warehouses to affected zones with a "Human-in-the-Loop" approval workflow.
* **Demand Prediction:** Utilizes Machine Learning (Random Forest/XGBoost) via AWS S3 models to forecast upcoming resource shortages based on temporal disaster data.
* **Live Command Center Dashboard:** Real-time metrics, interactive Leaflet maps, and comprehensive inventory/warehouse tracking.
* **Infrastructure as Code (IaC):** One-click AWS deployment via AWS Serverless Application Model (SAM).

---

## 🏗️ System Architecture

RESQ-CLOUD operates entirely within the AWS Cloud, focusing on the AWS Free Tier limitations without compromising performance.

* **Frontend:** React + TypeScript + Vite + Tailwind CSS (Hosted via AWS S3 / Amplify)
* **API Layer:** Amazon API Gateway
* **Compute:** AWS Lambda (Python 3.11/3.14)
* **Database:** Amazon DynamoDB (8 dedicated high-throughput tables)
* **ML Storage:** Amazon S3 (for `model.joblib` artifact retrieval)
* **CI/CD:** AWS CodePipeline & AWS CodeBuild (Configured via `pipeline.yaml`)

---

## 📁 Repository Structure

```text
RESQ/
├── backend/                  # AWS SAM Backend
│   ├── src/                  # Python Lambda Handlers & Logic
│   ├── template.yaml         # AWS SAM Infrastructure Definition
│   └── samconfig.toml        # SAM deployment configurations
├── frontend/                 # React Frontend
│   ├── src/                  # React Components, Pages, and Hooks
│   ├── public/               # Static assets
│   └── vite.config.ts        # Vite configuration
├── pipeline.yaml             # CI/CD AWS CloudFormation Template
└── README.md                 # Project Documentation
```

---

## 🛠️ Local Setup & Deployment

### 1. Backend (AWS SAM)
Prerequisites: AWS CLI, AWS SAM CLI, Python 3.11+
```bash
cd backend
sam build --use-container
sam deploy --guided
```
*Note: Make sure to export your API Gateway URL to the frontend environment.*

### 2. Frontend (React)
Prerequisites: Node.js 18+
```bash
cd frontend
npm install
npm run dev
```

### 3. CI/CD Pipeline
You can deploy the automated deployment pipeline using the provided CloudFormation template. You will need a CodeStar connection to your GitHub repo.
```bash
aws cloudformation deploy --template-file pipeline.yaml --stack-name resq-cloud-pipeline --capabilities CAPABILITY_IAM --parameter-overrides GitHubConnectionArn="YOUR_ARN"
```

---

## 🤝 Agile & DevOps Process
This project was developed strictly adhering to Agile methodologies:
* **Iterative Sprints:** Rapid prototyping of UI components, followed by backend integration, and finally ML implementation.
* **Continuous Integration / Continuous Deployment (CI/CD):** Integrated automated testing and deployment utilizing AWS CodePipeline to ensure zero downtime during critical updates.
* **Infrastructure as Code:** All infrastructure changes are version-controlled via SAM and CloudFormation, ensuring environment parity across development, staging, and production.

---

*Developed for the Agile Development and DevOps Process Review.*
