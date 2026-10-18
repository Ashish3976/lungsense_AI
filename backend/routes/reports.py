
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from main import get_db, XRay, Patient
from services.clinical_report import build_report

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("/xray/{xray_id}")
def report_for_xray(xray_id: int, db: Session = Depends(get_db)):
    xray = db.query(XRay).filter(XRay.id == xray_id).first()
    if not xray:
        raise HTTPException(status_code=404, detail="X-ray not found")
    patient = db.query(Patient).filter(Patient.id == xray.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    if not xray.result:
        raise HTTPException(status_code=400, detail="Analyze the X-ray before generating a report")
    return build_report(patient, xray, xray.result)
