# SarsClassifier - Kelompok 07 IF3211

Solusi komputasi biologi untuk mengklasifikasikan varian SARS-CoV-2 (Alpha, Delta, Omicron) berbasis Machine Learning dan Sequence Alignment (Needleman-Wunsch & Smith-Waterman dari nol).

## Anggota Kelompok 07 (K3):

- 13523126 Brian Ricardo Tamin
- 13523142 Nathanael Rachmat
- 13523148 Andrew Tedjapratama
- 13523154 Theo Kurniady

## Tech Stack

| Layer | Teknologi |
|---|---|
| Backend | Python, FastAPI, Uvicorn, Gunicorn |
| Bioinformatics | Biopython (SeqIO, BLOSUM62), NumPy |
| Machine Learning | scikit-learn (Random Forest, SVM RBF), pandas, joblib |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, Recharts |
| Notebook | JupyterLab, matplotlib, seaborn |
| Infrastructure | Docker Compose, Caddy (reverse proxy) |

## Metode Komputasi

**Sequence Alignment (implementasi dari nol)**

Kedua algoritma menggunakan dynamic programming dengan tiga matriks terpisah (M, X, Y) untuk mendukung affine gap penalty:

- **Needleman-Wunsch** — global alignment, kompleksitas O(mn)
- **Smith-Waterman** — local alignment, kompleksitas O(mn)

Scoring menggunakan **BLOSUM62** (substitution matrix berbasis evolusi protein), bukan simple match/mismatch. Gap penalty: open = -10, extend = -0.5.

**Feature Extraction**

Dari hasil NW alignment, diekstrak 4 fitur numerik sebagai input classifier:

| Fitur | Deskripsi |
|---|---|
| `length` | Panjang sekuens query (aa) |
| `score_blosum` | Total skor NW alignment (BLOSUM62 + affine gap) |
| `mismatches` | Jumlah substitusi (posisi non-gap, ref ≠ query) |
| `gap_count` | Total posisi gap dari alignment |

**Mutation Marker Detection**

Deteksi 8 marker mutasi karakteristik (N501Y, L452R, T478K, K417N, E484A, Q493R, Q498R, Y505H) berbasis posisi pada NW-aligned sequence terhadap referensi Wuhan-Hu-1.

**Classifier**

Random Forest (n_estimators=200) dan SVM (RBF kernel), dilatih pada 595 sekuens spike dari NCBI Virus. Akurasi: 98.3% (RF & SVM), CV mean: 94.6% ± 2.5%.

## Struktur Project

```
sars-classifier/
├── data/
│   ├── wuhan_ref.fasta          # Referensi Wuhan-Hu-1 spike (YP_009724390.1)
│   ├── alpha_spike.fasta
│   ├── delta_spike.fasta
│   ├── omicron_spike.fasta
│   └── sars_features_extracted.csv
├── notebook/
│   └── main.ipynb               # Training, evaluasi, feature importance
├── src/
│   ├── backend/
│   │   ├── alignment.py         # NW & SW dari nol (DP + affine gap)
│   │   ├── main.py              # FastAPI endpoint /api/classify
│   │   ├── model/
│   │   │   ├── sars_rf_model.joblib
│   │   │   ├── sars_svm_model.joblib
│   │   │   └── sars_scaler.joblib
│   │   └── Dockerfile
│   └── frontend/
│       └── src/
│           ├── App.tsx
│           └── components/
│               ├── SequenceForm.tsx
│               ├── ResultsTabs.tsx      # Prediction / Alignment / Features / Model tabs
│               ├── AlignmentView.tsx    # Visualisasi alignment (REF/QUERY color-coded)
│               ├── ConfusionMatrix.tsx
│               ├── FeatureImportanceChart.tsx
│               ├── VariantCards.tsx
│               └── MethodsSection.tsx
├── docker-compose.yml
├── Caddyfile
├── pyproject.toml
└── package.json                 # Root scripts (concurrently dev)
```

## How to Run

### Option 1: Docker Compose (recommended for demo)

```bash
docker compose up --build
```

Frontend: http://localhost:8000 · Backend: http://localhost:8080

---

### Option 2: Development (hot reload)

**Prerequisites:** [uv](https://docs.astral.sh/uv/), Node.js

```bash
# 1. Python env + deps
uv sync

# 2. Frontend deps
npm install --prefix src/frontend

# 3. Run backend + frontend concurrently
source .venv/bin/activate
npm run dev
```

Frontend: http://localhost:5173 · Backend: http://localhost:8080

**Notebook:**

```bash
source .venv/bin/activate
jupyter lab
```
