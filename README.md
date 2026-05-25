# SarsClassifier - Kelompok 07 IF3211

Solusi komputasi biologi untuk mengklasifikasikan varian SARS-CoV-2 (Alpha, Delta, Omicron) berbasis Machine Learning dan Sequence Alignment (Needleman-Wunsch & Smith-Waterman dari nol).

## Anggota Kelompok 07:
- 13523126 Brian Ricardo Tamin
- 13523142 Nathanael Rachmat
- 13523148 Andrew Tedjapratama
- 13523154 Theo Kurniady

## Tech Stack:
- **Backend:** Python, FastAPI, Biopython
- **Frontend:** React, Vite, Recharts
- **ML:** Scikit-Learn (Random Forest / SVM)

## Setup

```bash
uv sync
```

## Add Dependency

```bash
uv add <package-name>

# Dev dependency
uv add --dev <package-name>
```

## Run

```bash
gunicorn main:app \
  --chdir src/backend \
  -k uvicorn.workers.UvicornWorker \
  -w 4 \
  --env UVICORN_LOOP=uvloop \
  --env UVICORN_HTTP=httptools \
  -b 127.0.0.1:8080 \
  --log-level critical \
  --access-logfile /dev/null \
  --error-logfile /dev/null
```