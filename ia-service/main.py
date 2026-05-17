from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AgriNova IA")

app.add_middleware(CORSMiddleware,
  allow_origins=["http://localhost:3001"],
  allow_methods=["*"],
  allow_headers=["*"]
)

@app.get("/")
def health():
    return {"status": "AgriNova IA opérationnel"}

@app.post("/recommandations")
async def recommander(data: dict):
    # Logique IA ici
    return {"conseil": "Irriguer dans 2 jours"}