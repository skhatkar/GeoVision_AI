Write-Host "Starting GeoVision AI Backend..." -ForegroundColor Green

# Activate virtual environment
& ".\.venv\Scripts\Activate.ps1"

# Start FastAPI
uvicorn app.main:app --reload