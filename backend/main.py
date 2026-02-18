from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from backend.core.orchestrator import Orchestrator
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="IntentBridge API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = Orchestrator()

class SessionInput(BaseModel):
    session_id: str
    user_input: str
    history: Optional[List[dict]] = []

@app.get("/")
async def root():
    return {"message": "Welcome to IntentBridge API"}

@app.post("/api/v1/process")
async def process_intent(data: SessionInput):
    try:
        result = await orchestrator.execute_workflow(
            data.session_id, 
            data.user_input, 
            data.history
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
