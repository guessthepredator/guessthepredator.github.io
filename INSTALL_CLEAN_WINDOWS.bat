@echo off
setlocal
cd /d "%~dp0"
echo GTP2 V2.7 MIRAGE EDITION - CLEAN UP OLD MAP AND TESTS
echo This does not delete .git or your saved progress.
echo.
for %%V in (21 22 23 24 25 26) do (
  if exist "tests\v%%V.test.mjs" del /q "tests\v%%V.test.mjs"
)
if exist "tests\gtp2.test.mjs" del /q "tests\gtp2.test.mjs"
for %%F in (pinkshift.css dark-pink-v23.css eclipse-v24.css lightshift-v25.css MEDIA_STUDIO.html MEDIA_DIAGNOSTIC.html SOURCES_AND_RIGHTS.md) do (
  if exist "%%F" del /q "%%F"
)
for %%F in (maps.mjs map_runtime.mjs map_media_manifest.mjs external_map_sources.mjs concept_map_manifest.mjs announcer.mjs voice.mjs voice_manifest.mjs) do (
  if exist "src\%%F" del /q "src\%%F"
)
if exist "assets\maps" rmdir /s /q "assets\maps"
if exist "assets\map-catalog.json" del /q "assets\map-catalog.json"
if exist "assets\game-bg\map.svg" del /q "assets\game-bg\map.svg"
if exist "assets\sfx\hover-map.wav" del /q "assets\sfx\hover-map.wav"
where py >nul 2>nul
if not errorlevel 1 (
  py -3 scripts\clean_old_release.py
) else (
  where python >nul 2>nul
  if not errorlevel 1 python scripts\clean_old_release.py
)
echo.
echo Check ALL changes and deletions in GitHub Desktop.
echo Commit then Push origin. Database setup is separate: LEADERBOARD_SETUP.md
echo No new repository required.
pause
