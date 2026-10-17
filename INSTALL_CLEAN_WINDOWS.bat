@echo off
setlocal
cd /d "%~dp0"
echo GTP2 NOVA V2.6.1 - FIX GITHUB ACTIONS LEGACY TESTS
echo.
echo Removing obsolete tests from V2.1 - V2.5 (does not touch .git).
for %%V in (21 22 23 24 25) do (
  if exist "tests\v%%V.test.mjs" (
    del /q "tests\v%%V.test.mjs"
    echo REMOVED tests\v%%V.test.mjs
  )
)
for %%F in (pinkshift.css dark-pink-v23.css eclipse-v24.css lightshift-v25.css MEDIA_STUDIO.html MEDIA_DIAGNOSTIC.html) do (
  if exist "%%F" (
    del /q "%%F"
    echo REMOVED %%F
  )
)
if exist "src\announcer.mjs" del /q "src\announcer.mjs"
if exist "src\voice.mjs" del /q "src\voice.mjs"
if exist "src\voice_manifest.mjs" del /q "src\voice_manifest.mjs"
where py >nul 2>nul
if not errorlevel 1 (
  py -3 scripts\clean_old_release.py
) else (
  where python >nul 2>nul
  if not errorlevel 1 (
    python scripts\clean_old_release.py
  ) else (
    echo Python is optional. Legacy tests removed using Windows commands.
    echo GitHub Actions runs any additional cleanup on the deployment runner.
  )
)
echo.
echo IMPORTANT: Check DELETED tests and CHANGED pages.yml in GitHub Desktop.
echo Commit all changes and Push origin. Then check the new GitHub Actions run.
pause
