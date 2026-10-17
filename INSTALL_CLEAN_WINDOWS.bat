@echo off
cd /d "%~dp0"
echo GTP2 NOVA V2.6 - removing obsolete CSS, old audio and duplicate assets.
echo This script preserves .git, real map screenshots and user data.
where py >nul 2>nul
if %errorlevel%==0 (py -3 scripts\clean_old_release.py) else (python scripts\clean_old_release.py)
echo.
echo In GitHub Desktop, review deleted files, Commit and Push.
pause
