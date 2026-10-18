
from datetime import datetime

def build_report(patient, xray, analysis):
    diseases = analysis.get("diseases", {}) if analysis else {}
    top = analysis.get("top_disease", "No significant finding")
    score = analysis.get("top_score", 0)
    severity = analysis.get("severity", "Low")

    return {
        "patient": {
            "id": patient.id,
            "name": patient.name,
            "age": patient.age,
            "gender": patient.gender,
        },
        "xray": {
            "id": xray.id,
            "filename": xray.filename,
            "date": datetime.utcnow().isoformat(),
        },
        "summary": f"Demo preliminary finding: {top} ({score}%). Severity: {severity}.",
        "findings": diseases,
        "severity": severity,
        "recommendation": "For demonstration only. A qualified clinician must review the X-ray and all findings before any clinical decision.",
        "model_status": analysis.get("model_status", "DEMO") if analysis else "DEMO",
    }
