
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from PIL import Image, ImageFilter, ImageEnhance, ImageDraw
from main import get_db, XRay

router = APIRouter(prefix="/api/explainability", tags=["Explainability"])

@router.post("/gradcam/{xray_id}")
def gradcam(xray_id: int, db: Session = Depends(get_db)):
    xray = db.query(XRay).filter(XRay.id == xray_id).first()
    if not xray:
        raise HTTPException(status_code=404, detail="X-ray not found")
    src = Path(xray.file_path)
    if not src.exists():
        raise HTTPException(status_code=404, detail="X-ray file not found")
    out_dir = Path("uploads/processed")
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / f"gradcam_{xray.id}.png"
    im = Image.open(src).convert("RGB").resize((512, 512))
    # Demo visualization: blurred/high-contrast image with a translucent center marker.
    base = ImageEnhance.Contrast(im).enhance(1.35).filter(ImageFilter.GaussianBlur(0.4))
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    draw.ellipse((145, 120, 367, 390), fill=(255, 80, 30, 70), outline=(255, 120, 40, 180), width=4)
    result = Image.alpha_composite(base.convert("RGBA"), overlay).convert("RGB")
    result.save(out)
    xray.gradcam_path = str(out)
    db.commit()
    return {"xray_id": xray.id, "path": str(out), "status": "DEMO_GRADCAM"}
