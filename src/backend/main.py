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
    mismatches, gaps, gap_openings = 0, 0, 0
    in_gap = False
    for r, q in zip(aligned_ref, aligned_query):
        if r == '-' or q == '-':
            gaps += 1
            if not in_gap:
                gap_openings += 1
                in_gap = True
        else:
            in_gap = False
            if r != q:
                mismatches += 1
    return mismatches, gaps, gap_openings

def calculate_identity_percentage(aligned_ref, aligned_query):
    matches, aligned = 0, 0
    for r, q in zip(aligned_ref, aligned_query):
        if r != '-' and q != '-':
            aligned += 1
            if r == q:
                matches += 1
    return (matches / aligned * 100) if aligned > 0 else 0

def detect_mutations(aligned_ref, aligned_query):
    # 1-indexed spike positions; marker format: <ref_AA><pos><alt_AA>
    markers = {
        501: "N501Y",  # Alpha, Omicron
        452: "L452R",  # Delta
        478: "T478K",  # Delta
        417: "K417N",  # Omicron
        484: "E484A",  # Omicron
        493: "Q493R",  # Omicron
        498: "Q498R",  # Omicron
        505: "Y505H",  # Omicron
    }

    detected = []
    ref_pos = 1

    for r, q in zip(aligned_ref, aligned_query):
        if r != '-':
            if ref_pos in markers:
                marker = markers[ref_pos]
                if r == marker[0] and q == marker[-1]:
                    detected.append(marker)
            ref_pos += 1

    return detected

@app.post("/api/classify")
async def classify_sequence(request: SequenceRequest):
    query = request.sequence.strip().upper()
    if not query:
        raise HTTPException(status_code=400, detail="Sequence payload cannot be empty.")
    if not wuhan_seq:
        raise HTTPException(status_code=500, detail="Wuhan reference genome file missing on server.")

    nw_score, al_wuhan, al_query = needleman_wunsch_affine(wuhan_seq, query)
    nw_mismatches, nw_gaps, nw_gap_openings = calculate_mutations(al_wuhan, al_query)
    nw_identity = calculate_identity_percentage(al_wuhan, al_query)
    nw_markers = detect_mutations(al_wuhan, al_query)

    length = len(query)
    features = pd.DataFrame(
        [[length, nw_score, nw_mismatches, nw_gaps]],
        columns=["length", "score_blosum", "mismatches", "gap_count"]
    )

    if request.model_type.lower() == "svm":
        features_scaled = scaler.transform(features)
        prediction = model_svm.predict(features_scaled)[0]
        probabilities = None
        confidence = 1.0  # SVM has no predict_proba in this config
    else:
        prediction = model_rf.predict(features)[0]
        probs = model_rf.predict_proba(features)[0]
        probabilities = {model_rf.classes_[i]: float(probs[i]) for i in range(len(model_rf.classes_))}
        confidence = float(max(probs))

    sw_score, sw_ref, sw_query = smith_waterman_affine(wuhan_seq, query)
    sw_identity = calculate_identity_percentage(sw_ref, sw_query)

    return {
        "prediction": prediction,
        "confidence": confidence,
        "probabilities": probabilities,
        "detected_markers": nw_markers,
        "features": {
            "length": length,
            "score_blosum": nw_score,
            "mismatches": nw_mismatches,
            "gap_count": nw_gaps,
            "gap_openings": nw_gap_openings,
            "identity_pct": nw_identity
        },
        "alignment_global": {
            "score": nw_score,
            "reference": al_wuhan,
            "query": al_query,
            "identity_pct": nw_identity,
            "gap_openings": nw_gap_openings
        },
        "alignment_local": {
            "score": sw_score,
            "reference": sw_ref,
            "query": sw_query,
            "identity_pct": sw_identity
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
