import os
import shutil
from datetime import datetime, timedelta, timezone
from pathlib import Path

import bcrypt
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.staticfiles import StaticFiles
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, create_engine
from sqlalchemy.orm import Session, declarative_base, relationship, sessionmaker

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "lungsense-development-secret-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./lungsense.db")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads" / "xrays"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {})
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()

app = FastAPI(title="LungSense AI API", description="Module 2: patients and X-ray uploads", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=[x.strip() for x in CORS_ORIGINS], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.mount("/uploads", StaticFiles(directory=str(BASE_DIR / "uploads")), name="uploads")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(30), default="DOCTOR", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    patients = relationship("Patient", back_populates="doctor")

class Patient(Base):
    __tablename__ = "patients"
    id = Column(Integer, primary_key=True, index=True)
    patient_code = Column(String(30), unique=True, index=True, nullable=False)
    name = Column(String(120), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(20), nullable=False)
    phone = Column(String(30), default="")
    email = Column(String(255), default="")
    blood_group = Column(String(10), default="")
    address = Column(String(300), default="")
    medical_history = Column(Text, default="")
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    doctor = relationship("User", back_populates="patients")
    xrays = relationship("XRayRecord", back_populates="patient", cascade="all, delete-orphan")

class XRayRecord(Base):
    __tablename__ = "xray_records"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    original_filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)
    status = Column(String(40), default="UPLOADED", nullable=False)
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    patient = relationship("Patient", back_populates="xrays")

Base.metadata.create_all(bind=engine)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
class LoginRequest(BaseModel):
    email: EmailStr
    password: str
class PatientCreate(BaseModel):
    name: str
    age: int
    gender: str
    phone: str = ""
    email: str = ""
    blood_group: str = ""
    address: str = ""
    medical_history: str = ""
class PatientUpdate(PatientCreate):
    pass
class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

def hash_password(password): return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
def verify_password(password, password_hash):
    try: return bcrypt.checkpw(password.encode(), password_hash.encode())
    except (ValueError, TypeError): return False

def create_access_token(user_id):
    expires = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": str(user_id), "exp": expires}, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    error = HTTPException(status_code=401, detail="Invalid or expired authentication token", headers={"WWW-Authenticate":"Bearer"})
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id: raise error
    except JWTError: raise error
    user = db.get(User, int(user_id))
    if not user or not user.is_active: raise error
    return user

def patient_dict(p):
    return {"id":p.id,"patient_code":p.patient_code,"name":p.name,"age":p.age,"gender":p.gender,"phone":p.phone,"email":p.email,"blood_group":p.blood_group,"address":p.address,"medical_history":p.medical_history,"created_at":p.created_at.isoformat(),"xray_count":len(p.xrays)}

def seed_patients(db, doctor):
    if db.query(Patient).filter(Patient.doctor_id == doctor.id).count() > 0: return
    samples = [
        ("Rahul Kumar",45,"Male","9876543210","rahul@example.com","B+","Vijayawada","Asthma history"),
        ("Priya Devi",32,"Female","9876543211","priya@example.com","O+","Eluru","No major history"),
        ("Arjun Reddy",58,"Male","9876543212","arjun@example.com","A+","Hyderabad","Previous respiratory infection"),
        ("Ananya Rao",41,"Female","9876543213","ananya@example.com","AB+","Guntur","Diabetes"),
        ("Suresh Babu",67,"Male","9876543214","suresh@example.com","O-","Rajahmundry","Chronic cough under evaluation"),
    ]
    for i, s in enumerate(samples, 1):
        db.add(Patient(patient_code=f"P{1000+i}", name=s[0], age=s[1], gender=s[2], phone=s[3], email=s[4], blood_group=s[5], address=s[6], medical_history=s[7], doctor_id=doctor.id))
    db.commit()

@app.on_event("startup")
def startup_seed():
    db = SessionLocal()
    try:
        doctor = db.query(User).filter(User.email == "doctor@lungsense.ai").first()
        if not doctor:
            doctor = User(name="Dr. LungSense", email="doctor@lungsense.ai", password_hash=hash_password("Doctor@123"), role="DOCTOR")
            db.add(doctor); db.commit(); db.refresh(doctor)
        seed_patients(db, doctor)
    finally: db.close()

@app.get("/")
def root(): return {"message":"LungSense AI API is running","version":"2.0.0"}
@app.get("/api/health")
def health(): return {"status":"ok"}

@app.post("/api/auth/register", response_model=UserResponse)
def register(data:RegisterRequest, db:Session=Depends(get_db)):
    name=data.name.strip(); email=data.email.lower().strip()
    if len(name)<2: raise HTTPException(400,"Name must contain at least 2 characters")
    if len(data.password)<6: raise HTTPException(400,"Password must contain at least 6 characters")
    if db.query(User).filter(User.email==email).first(): raise HTTPException(409,"An account with this email already exists")
    user=User(name=name,email=email,password_hash=hash_password(data.password),role="DOCTOR")
    db.add(user); db.commit(); db.refresh(user); seed_patients(db,user)
    return user

@app.post("/api/auth/login", response_model=TokenResponse)
def login(data:LoginRequest, db:Session=Depends(get_db)):
    user=db.query(User).filter(User.email==data.email.lower().strip()).first()
    if not user or not verify_password(data.password,user.password_hash): raise HTTPException(401,"Invalid email or password")
    return {"access_token":create_access_token(user.id),"token_type":"bearer","user":user}

@app.get("/api/auth/me", response_model=UserResponse)
def me(current_user:User=Depends(get_current_user)): return current_user

@app.get("/api/dashboard")
def dashboard(current_user:User=Depends(get_current_user), db:Session=Depends(get_db)):
    patients=db.query(Patient).filter(Patient.doctor_id==current_user.id).all()
    xrays=db.query(XRayRecord).join(Patient).filter(Patient.doctor_id==current_user.id).order_by(XRayRecord.uploaded_at.desc()).limit(5).all()
    return {"total_patients":len(patients),"xrays_analyzed":sum(1 for x in xrays if x.status=="ANALYZED"),"reports_generated":0,"recent_analyses":[{"patient":x.patient.name,"filename":x.original_filename,"status":x.status,"date":x.uploaded_at.strftime("%d %b %Y")} for x in xrays]}

@app.get("/api/patients")
def list_patients(current_user:User=Depends(get_current_user), db:Session=Depends(get_db)):
    return [patient_dict(p) for p in db.query(Patient).filter(Patient.doctor_id==current_user.id).order_by(Patient.id.desc()).all()]

@app.post("/api/patients")
def create_patient(data:PatientCreate,current_user:User=Depends(get_current_user),db:Session=Depends(get_db)):
    if data.age<0 or data.age>130: raise HTTPException(400,"Enter a valid age")
    code=f"P{1000 + db.query(Patient).count() + 1}"
    while db.query(Patient).filter(Patient.patient_code==code).first(): code=f"P{1000 + db.query(Patient).count() + 2}"
    p=Patient(patient_code=code,doctor_id=current_user.id,**data.model_dump())
    db.add(p); db.commit(); db.refresh(p); return patient_dict(p)

@app.get("/api/patients/{patient_id}")
def get_patient(patient_id:int,current_user:User=Depends(get_current_user),db:Session=Depends(get_db)):
    p=db.query(Patient).filter(Patient.id==patient_id,Patient.doctor_id==current_user.id).first()
    if not p: raise HTTPException(404,"Patient not found")
    return patient_dict(p)

@app.put("/api/patients/{patient_id}")
def update_patient(patient_id:int,data:PatientUpdate,current_user:User=Depends(get_current_user),db:Session=Depends(get_db)):
    p=db.query(Patient).filter(Patient.id==patient_id,Patient.doctor_id==current_user.id).first()
    if not p: raise HTTPException(404,"Patient not found")
    for k,v in data.model_dump().items(): setattr(p,k,v)
    db.commit(); db.refresh(p); return patient_dict(p)

@app.delete("/api/patients/{patient_id}")
def delete_patient(patient_id:int,current_user:User=Depends(get_current_user),db:Session=Depends(get_db)):
    p=db.query(Patient).filter(Patient.id==patient_id,Patient.doctor_id==current_user.id).first()
    if not p: raise HTTPException(404,"Patient not found")
    db.delete(p); db.commit(); return {"message":"Patient deleted"}

@app.get("/api/patients/{patient_id}/xrays")
def patient_xrays(patient_id:int,current_user:User=Depends(get_current_user),db:Session=Depends(get_db)):
    p=db.query(Patient).filter(Patient.id==patient_id,Patient.doctor_id==current_user.id).first()
    if not p: raise HTTPException(404,"Patient not found")
    return [{"id":x.id,"filename":x.original_filename,"file_url":x.file_url,"status":x.status,"uploaded_at":x.uploaded_at.isoformat()} for x in p.xrays]

@app.post("/api/patients/{patient_id}/xrays")
def upload_xray(patient_id:int,file:UploadFile=File(...),current_user:User=Depends(get_current_user),db:Session=Depends(get_db)):
    p=db.query(Patient).filter(Patient.id==patient_id,Patient.doctor_id==current_user.id).first()
    if not p: raise HTTPException(404,"Patient not found")
    allowed={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"}
    if file.content_type not in allowed: raise HTTPException(400,"Upload a JPG, PNG, or WEBP X-ray image")
    safe_name=f"patient_{patient_id}_{int(datetime.now().timestamp())}.{allowed[file.content_type]}"
    destination=UPLOAD_DIR/safe_name
    with destination.open("wb") as buffer: shutil.copyfileobj(file.file,buffer)
    record=XRayRecord(patient_id=patient_id,original_filename=file.filename or safe_name,stored_filename=safe_name,file_url=f"/uploads/xrays/{safe_name}",status="UPLOADED")
    db.add(record); db.commit(); db.refresh(record)
    return {"id":record.id,"filename":record.original_filename,"file_url":record.file_url,"status":record.status,"message":"X-ray uploaded successfully. AI analysis will be connected in the next module."}

try:
    from routes.analysis import router as analysis_router
    app.include_router(analysis_router)
except Exception:
    pass

try:
    from routes.reports import router as reports_router
    app.include_router(reports_router)
except Exception:
    pass
try:
    from routes.explainability import router as explainability_router
    app.include_router(explainability_router)
except Exception:
    pass
