# SarsClassifier - Kelompok 07 IF3211

Solusi komputasi biologi untuk mengklasifikasikan varian SARS-CoV-2 (Alpha, Delta, Omicron) berbasis Machine Learning dan Sequence Alignment (Needleman-Wunsch & Smith-Waterman dari nol).

## Anggota Kelompok 07 (K3):

- 13523126 Brian Ricardo Tamin
- 13523142 Nathanael Rachmat
- 13523148 Andrew Tedjapratama
- 13523154 Theo Kurniady

## Tech Stack

| Layer            | Teknologi                                                        |
| ---------------- | ---------------------------------------------------------------- |
| Backend          | Python, FastAPI, Uvicorn                                         |
| Bioinformatics   | Biopython (SeqIO, BLOSUM62), NumPy                               |
| Machine Learning | scikit-learn (Random Forest, SVM RBF), pandas, joblib            |
| Frontend         | React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, Recharts |
| Notebook         | JupyterLab, matplotlib, seaborn                                  |
| Infrastructure   | Docker Compose, Caddy (reverse proxy)                            |

## Metode Komputasi

**Sequence Alignment (implementasi dari nol)**

Kedua algoritma menggunakan dynamic programming dengan tiga matriks terpisah (M, X, Y) untuk mendukung affine gap penalty:

- **Needleman-Wunsch** — global alignment, kompleksitas O(mn)
- **Smith-Waterman** — local alignment, kompleksitas O(mn)

Scoring menggunakan **BLOSUM62** (substitution matrix berbasis evolusi protein), bukan simple match/mismatch. Gap penalty: open = -10, extend = -0.5.

**Feature Extraction**

Dari hasil NW alignment, diekstrak 4 fitur numerik sebagai input classifier:

| Fitur          | Deskripsi                                       |
| -------------- | ----------------------------------------------- |
| `length`       | Panjang sekuens query (aa)                      |
| `score_blosum` | Total skor NW alignment (BLOSUM62 + affine gap) |
| `mismatches`   | Jumlah substitusi (posisi non-gap, ref ≠ query) |
| `gap_count`    | Total posisi gap dari alignment                 |

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

## Referensi

[1] S. B. Needleman and C. D. Wunsch, "A general method applicable to the search for similarities in the amino acid sequence of two proteins," Journal of Molecular Biology, vol. 48, no. 3, pp. 443–453, 1970.

[2] T. F. Smith and M. S. Waterman, "Identification of common molecular subsequences," Journal of Molecular Biology, vol. 147, no. 1, pp. 195–197, 1981.

[3] S. F. Altschul et al., "Basic Local Alignment Search Tool," Journal of Molecular Biology, vol. 215, no. 3, pp. 403–410, 1990.

[4] S. Henikoff and J. G. Henikoff, "Amino acid substitution matrices from protein blocks," PNAS, vol. 89, no. 22, pp. 10915–10919, 1992.

[5] P. J. A. Cock et al., "Biopython: freely available Python tools for computational molecular biology and bioinformatics," Bioinformatics, vol. 25, no. 11, pp. 1422–1423, 2009.

[6] J. Hadfield et al., "Nextstrain: real-time tracking of pathogen evolution," Bioinformatics, vol. 34, no. 23, pp. 4121–4123, 2018.
