import numpy as np
from sklearn.ensemble import RandomForestClassifier
import joblib

# Simulated training data based on registrar features:
# [days_pending, has_suspicious_phone, has_disposable_email, duplicate_name_count]
X_train = [
    [2, 0, 0, 1],
    [15, 1, 1, 2],
    [30, 1, 0, 1],
    [1, 0, 0, 1],
    [45, 1, 1, 3],
    [5, 0, 1, 1]
]
# Labels: 0 = Normal, 1 = Flagged/High Risk
y_train = [0, 1, 1, 0, 1, 0]

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

joblib.dump(model, "registrar_risk_model.joblib")
print("Trained model saved successfully as registrar_risk_model.joblib")