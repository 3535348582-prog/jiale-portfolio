@echo off
cd /d "%~dp0"
python serve_range.py --port 8796 --bind 127.0.0.1
pause
