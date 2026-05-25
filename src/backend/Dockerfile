FROM python:3.14-slim

WORKDIR /app

COPY pyproject.toml .

RUN pip install --no-cache-dir .

COPY . .

EXPOSE 8080

CMD ["gunicorn", "main:app", \
     "--chdir", "src/backend", \
     "-k", "uvicorn.workers.UvicornWorker", \
     "-w", "4", \
     "--env", "UVICORN_LOOP=uvloop", \
     "--env", "UVICORN_HTTP=httptools", \
     "-b", "0.0.0.0:8080", \
     "--log-level", "critical", \
     "--access-logfile", "/dev/null", \
     "--error-logfile", "/dev/null"]
