import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib

app = FastAPI(title="Trained Registrar AI Microservice")

# Load pre-trained model
model_path = "registrar_risk_model.joblib"
if os.path.exists(model_path):
    model = joblib.load(model_path)
else:
    model = None

class PredictionRequest(BaseModel):
    daysPending: int
    suspiciousPhone: int
    suspiciousEmail: int
    duplicateNameCount: int

@app.post("/predict-risk")
def predict_risk(data: PredictionRequest):
    if not model:
        raise HTTPException(status_code=500, detail="Trained model not found.")
    
    features = [[
        data.daysPending,
        data.suspiciousPhone,
        data.suspiciousEmail,
        data.duplicateNameCount
    ]]
    
    prediction = model.predict(features)[0]
    probability = model.predict_proba(features)[0][1]
    
    return {
        "isFlagged": bool(prediction),
        "riskScore": float(probability)
    }