@echo off
cd /d "%~dp0"
echo GTP2 V2.4 - removing old Media Studio and obsolete assets (keeps .git).
where py >nul 2>nul
if %errorlevel%==0 (
 py -3 scripts\clean_old_release.py
) else (
 python scripts\clean_old_release.py
)
echo.
echo Now use GitHub Desktop: check the deleted old files, Commit, Push.
pause
