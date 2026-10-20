@echo off
title Numen
cd /d "%~dp0"
where py >nul 2>nul
if not errorlevel 1 (
  py -3 server.py
  goto :done
)
where python >nul 2>nul
if not errorlevel 1 (
  python server.py
  goto :done
)
echo Python 3 was not found. Install it from python.org, then run this again.
:done
if errorlevel 1 pause
