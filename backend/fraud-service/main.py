from fastapi import FastAPI
from pydantic import BaseModel
import random

app = FastAPI()

class ClaimData(BaseModel):
    worker_id: str
    gps_lat: float
    gps_long: float
    order_count_last_4h: int
    ip_address: str

@app.post("/score")
async def calculate_fraud_score(data: ClaimData):
    score = 0
    
    # Logic 1: Activity during disruption
    # If they are doing many orders during a "disruption", it's suspicious
    if data.order_count_last_4h > 2:
        score += 40
        
    # Logic 2: Movement Check (Simulated)
    # If speed is too high or movement is zero, adjust score
    movement_factor = random.randint(0, 30)
    score += movement_factor
    
    # Logic 3: Technical Check
    if "127.0.0.1" in data.ip_address: # Local proxy check
        score += 10

    category = "SAFE"
    if score > 60:
        category = "FRAUDULENT"
    elif score > 30:
        category = "SUSPICIOUS"

    return {
        "fraud_score": score,
        "category": category,
        "recommendation": "BLOCK" if score > 60 else "REVIEW" if score > 30 else "APPROVE"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
