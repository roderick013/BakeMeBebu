@echo off
title Bake Me, Bebu! Local Web Server
echo ==========================================================
echo   🧁 Starting Bake Me, Bebu! Local Web Server...
echo ==========================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
pause
