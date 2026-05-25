#!/bin/bash

TARGET_DIR="/home/opc/sars-classifier"

echo "=========================================================="
echo "[STAGE: DEPLOY] STARTING DEPLOYMENT"
echo "=========================================================="

if [ -d "$TARGET_DIR" ]; then
    cd "$TARGET_DIR" || exit
    echo "[1/5] Fetching latest code from GitHub..."
    git reset --hard HEAD
    git pull origin main
else
    echo "Error: Direktori $TARGET_DIR tidak ditemukan!"
    exit 1
fi

echo "[2/5] Building new Docker images in background..."
sudo docker-compose build

echo "[3/5] Instantly switching to new containers..."
sudo docker-compose up -d

echo "[4/5] Cleaning up old images and cache (System Prune)..."
sudo docker system prune -af

echo "[5/5] Checking container status..."
sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo "=========================================================="
echo "[DEPLOY SUCCESS] Web updated!"
echo "=========================================================="
