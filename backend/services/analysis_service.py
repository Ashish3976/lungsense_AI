
from pathlib import Path
from PIL import Image
import hashlib
import random

DISEASES = [
    "Pneumonia",
    "Tuberculosis",
    "COVID-19",
    "Lung Cancer",
    "Pulmonary Fibrosis",
    "Pleural Effusion",
]

def analyze_xray(file_path: str):
    """
    Module 3 demo inference.
    This is intentionally a deterministic demo until a trained model is connected.
    It validates the image and produces reproducible sample probabilities.
    """
    path = Path(file_path)
    image = Image.open(path).convert("RGB")
    if image.width < 128 or image.height < 128:
        raise ValueError("X-ray image is too small. Please upload an image at least 128x128.")

    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    rng = random.Random(int(digest[:12], 16))

    raw = [rng.uniform(0.01, 0.30) for _ in DISEASES]
    # Keep demo values realistic and normalize to independent 0-100 probabilities.
    scores = {d: round(v * 100, 2) for d, v in zip(DISEASES, raw)}

    top_disease = max(scores, key=scores.get)
    top_score = scores[top_disease]

    if top_score < 20:
        severity = "Low"
    elif top_score < 45:
        severity = "Moderate"
    else:
        severity = "High"

    return {
        "diseases": scores,
        "top_disease": top_disease,
        "top_score": top_score,
        "severity": severity,
        "model_status": "DEMO",
        "message": "Demo inference only. Connect a trained medical imaging model before clinical use."
    }
