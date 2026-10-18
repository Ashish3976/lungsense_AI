# LungSense AI — Complete Project (Modules 1–All)

This package combines the project foundation and all planned application modules.

## Modules included
1. React + Vite frontend
2. FastAPI backend
3. JWT + BCrypt authentication
4. Doctor dashboard
5. Patient management
6. Sample patient data
7. X-ray upload and records
8. Multi-disease analysis workflow
9. Severity assessment
10. Explainable AI / Grad-CAM demo
11. Preliminary clinical report generation
12. Analysis history
13. Settings
14. SQLite storage
15. Swagger API documentation

## Target diseases
Pneumonia, Tuberculosis, COVID-19, Lung Cancer, Pulmonary Fibrosis, Pleural Effusion.

## Important model note
The current analysis and Grad-CAM implementations are demonstration implementations. They are not clinically validated and must not be used to diagnose patients. Replace the demo inference service with a trained and validated model for research evaluation.

## Run backend
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

## Run frontend
```powershell
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173
API docs: http://127.0.0.1:8000/docs

Demo login:
doctor@lungsense.ai
Doctor@123
