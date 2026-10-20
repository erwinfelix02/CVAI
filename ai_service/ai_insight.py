import os
import re
import cv2
import numpy as np
import pytesseract
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
import joblib

app = FastAPI(title="Trained Registrar AI Microservice with Document/Vision Verification")

# Load pre-trained model
model_path = "registrar_risk_model.joblib"
if os.path.exists(model_path):
    model = joblib.load(model_path)
    print("Model loaded successfully from:", model_path)
else:
    model = None
    print("WARNING: 'registrar_risk_model.joblib' not found in this directory!")

class PredictionRequest(BaseModel):
    daysPending: int
    suspiciousPhone: int
    suspiciousEmail: int
    duplicateNameCount: int
    rawPhone: str = ""
    missingDocuments: int = 0
    idPhotoPath: str = ""        # 🟢 Local file path or URL to check 2x2 photo
    birthCertPath: str = ""      # 🟢 Local file path or URL to check birth cert

# Load OpenCV's pre-trained face detector
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

def verify_human_face(image_path: str) -> bool:
    """Checks if a 2x2 ID photo actually contains a human face."""
    if not image_path or not os.path.exists(image_path):
        return False  # File missing or invalid path
    
    try:
        img = cv2.imread(image_path)
        if img is None:
            return False
        
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        
        # Returns True if at least one face is detected
        return len(faces) > 0
    except Exception as e:
        print("Error during face detection:", str(e))
        return False

def verify_birth_certificate_content(doc_path: str) -> bool:
    """Uses OCR to check if the uploaded document contains birth certificate keywords."""
    if not doc_path or not os.path.exists(doc_path):
        return False
    
    try:
        img = cv2.imread(doc_path)
        if img is None:
            return False
        
        # Extract text using Tesseract OCR
        extracted_text = pytesseract.image_to_string(img).lower()
        
        # Check for mandatory official keywords
        keywords = ["certificate of live birth", "republic of the philippines", "civil registrar", "birth"]
        match_count = sum(1 for kw in keywords if kw in extracted_text)
        
        # Consider valid if at least 2 key terms match
        return match_count >= 2
    except Exception as e:
        print("Error during OCR text extraction:", str(e))
        return False

@app.post("/predict-risk")
def predict_risk(data: PredictionRequest):
    if not model:
        raise HTTPException(status_code=500, detail="Trained model not found on server.")
    
    try:
        # 1. Vision Check: Verify 2x2 Photo has a Human Face
        has_human_face = verify_human_face(data.idPhotoPath)
        fake_id_photo = 0 if has_human_face else 1

        # 2. OCR Check: Verify Birth Certificate text authenticity
        is_valid_birth_cert = verify_birth_certificate_content(data.birthCertPath)
        fake_birth_cert = 0 if is_valid_birth_cert else 1

        # Adjust total document issues dynamically based on vision/OCR results
        total_doc_issues = data.missingDocuments + fake_id_photo + fake_birth_cert

        features = [[
            data.daysPending,
            data.suspiciousPhone,
            data.suspiciousEmail,
            data.duplicateNameCount
        ]]
        
        prediction = model.predict(features)[0]
        probability = model.predict_proba(features)[0][1]

        # Force flag if computer vision detects a fake/invalid ID or Birth Cert
        is_flagged = bool(prediction) or fake_id_photo == 1 or fake_birth_cert == 1
        
        return {
            "isFlagged": is_flagged,
            "riskScore": float(probability) if not is_flagged else 0.85,
            "visionChecks": {
                "hasHumanFace": has_human_face,
                "isValidBirthCert": is_valid_birth_cert
            }
        }
    except Exception as e:
        print("Error during advanced verification:", str(e))
        raise HTTPException(status_code=500, detail=str(e))