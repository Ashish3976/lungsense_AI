
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from main import get_db, XRay
from services.analysis_service import analyze_xray

router = APIRouter(prefix="/api/analysis", tags=["Analysis"])

@router.post("/xray/{xray_id}")
def analyze_uploaded_xray(xray_id: int, db: Session = Depends(get_db)):
    xray = db.query(XRay).filter(XRay.id == xray_id).first()
    if not xray:
        raise HTTPException(status_code=404, detail="X-ray record not found")

    try:
        result = analyze_xray(xray.file_path)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Unable to analyze X-ray: {exc}")

    xray.status = "ANALYZED"
    xray.result = result
    db.commit()
    db.refresh(xray)

    return {
        "id": xray.id,
        "patient_id": xray.patient_id,
        "filename": xray.filename,
        **result
    }

@router.get("/xray/{xray_id}")
def get_xray_analysis(xray_id: int, db: Session = Depends(get_db)):
    xray = db.query(XRay).filter(XRay.id == xray_id).first()
    if not xray:
        raise HTTPException(status_code=404, detail="X-ray record not found")

    return {
        "id": xray.id,
        "patient_id": xray.patient_id,
        "filename": xray.filename,
        "status": xray.status,
        "result": xray.result
    }
