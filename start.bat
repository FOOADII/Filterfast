@echo off
echo Starting FilterFast...
echo.

echo Starting Backend Server...
start "FilterFast Backend" cmd /k "cd backend && npm install && npm start"

echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo Starting Frontend Server...
start "FilterFast Frontend" cmd /k "cd frontend && npm install && npm run dev"

echo.
echo FilterFast is starting up!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
pause >nul
