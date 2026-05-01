# Run full project setup: copy dataset, create venv, train model, build and run Docker
# Usage: Right-click -> Run with PowerShell, or run from an elevated PowerShell session.

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "Project root: $root"

# Source CSV in this folder (the large CSV the user attached)
$srcCsv = Join-Path $root "c_secure_compliance_dataset_10k (1).csv"
$dstDir = Join-Path $root "xai-code-auditor\datasets"
$dstCsv = Join-Path $dstDir "provided_dataset.csv"

if (-not (Test-Path $srcCsv)) {
    Write-Host "Source CSV not found at: $srcCsv"
    Write-Host "Please place your dataset named 'c_secure_compliance_dataset_10k (1).csv' in the project root and retry."
    exit 1
}

# Ensure datasets folder exists
if (-not (Test-Path $dstDir)) { New-Item -ItemType Directory -Path $dstDir | Out-Null }
Copy-Item -Path $srcCsv -Destination $dstCsv -Force
Write-Host "Copied dataset to $dstCsv"

# Create and activate virtualenv
$venvDir = Join-Path $root ".venv"
if (-not (Test-Path $venvDir)) {
    python -m venv .venv
}

# Activate environment for the remainder of the script
$activate = Join-Path $venvDir "Scripts\Activate.ps1"
if (Test-Path $activate) {
    Write-Host "Activating virtual environment..."
    & $activate
} else {
    Write-Host "Could not find virtualenv activation script at: $activate"
}

# Install backend requirements (may take time)
Write-Host "Installing Python dependencies for backend (may take several minutes)..."
pip install --upgrade pip
pip install -r "xai-code-auditor/backend/requirements.txt"

# Train model (quick run with default small number of epochs)
Write-Host "Starting model training (this may take a long time depending on dataset and hardware)..."
python "xai-code-auditor/backend/train.py" --dataset "xai-code-auditor/datasets/provided_dataset.csv" --output-dir "xai-code-auditor/backend/models/artifacts" --epochs 1

# Build and start containers
Write-Host "Building and starting Docker Compose services..."
cd "$root\xai-code-auditor"
docker-compose build
docker-compose up -d

Write-Host "Setup complete. Backend available at http://localhost:8000 (if Docker started successfully)."
