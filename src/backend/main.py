import os
import sys
import pandas as pd
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import joblib

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from alignment import needleman_wunsch_affine, smith_waterman_affine

app = FastAPI(title="SARS-CoV-2 Variant Classifier API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "model")
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../data"))

model_rf = joblib.load(os.path.join(MODEL_DIR, "sars_rf_model.joblib"))
model_svm = joblib.load(os.path.join(MODEL_DIR, "sars_svm_model.joblib"))
scaler = joblib.load(os.path.join(MODEL_DIR, "sars_scaler.joblib"))

wuhan_path = os.path.join(DATA_DIR, "wuhan_ref.fasta")
if os.path.exists(wuhan_path):
    from Bio import SeqIO
    wuhan_record = next(SeqIO.parse(wuhan_path, "fasta"))
    wuhan_seq = str(wuhan_record.seq)
else:
    wuhan_seq = ""

class SequenceRequest(BaseModel):
    sequence: str
    model_type: str = "rf"

def calculate_mutations(aligned_ref, aligned_query):
    mismatches, gaps = 0, 0
    for r, q in zip(aligned_ref, aligned_query):
        if r == '-' or q == '-':
            gaps += 1
        elif r != q:
            mismatches += 1
    return mismatches, gaps

@app.post("/api/classify")
async def classify_sequence(request: SequenceRequest):
    query = request.sequence.strip().upper()
    if not query:
        raise HTTPException(status_code=400, detail="Sequence payload cannot be empty.")
        
    if not wuhan_seq:
        raise HTTPException(status_code=500, detail="Wuhan reference genome file missing on server.")

    nw_score, al_wuhan, al_query = needleman_wunsch_affine(wuhan_seq, query)
    mismatches, gaps = calculate_mutations(al_wuhan, al_query)
    length = len(query)

    features = pd.DataFrame(
        [[length, nw_score, mismatches, gaps]], 
        columns=["length", "score_blosum", "mismatches", "gap_count"]
    )

    if request.model_type.lower() == "svm":
        features_scaled = scaler.transform(features)
        prediction = model_svm.predict(features_scaled)[0]
        probabilities = None
    else:
        prediction = model_rf.predict(features)[0]
        probs = model_rf.predict_proba(features)[0]
        probabilities = {model_rf.classes_[i]: float(probs[i]) for i in range(len(model_rf.classes_))}

    sw_score, sw_ref, sw_query = smith_waterman_affine(wuhan_seq, query)

    return {
        "prediction": prediction,
        "probabilities": probabilities,
        "features": {
            "length": length,
            "score_blosum": nw_score,
            "mismatches": mismatches,
            "gap_count": gaps
        },
        "alignment_global": {
            "score": nw_score,
            "reference": al_wuhan,
            "query": al_query
        },
        "alignment_local": {
            "score": sw_score,
            "reference": sw_ref,
            "query": sw_query
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
