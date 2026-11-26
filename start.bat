@echo off
REM ArchDraw Intel — local launcher (Windows)
REM Double-click this file, or run it from Command Prompt.

cd /d "%~dp0"

echo.
echo   ArchDraw Intel — local setup
echo   ─────────────────────────────

REM ── Node check ──────────────────────────────────────────────────────────────
where node >nul 2>&1
if errorlevel 1 (
  echo.
  echo   Node.js is not installed.
  echo   Download it at: https://nodejs.org  ^(LTS version^)
  echo.
  pause
  exit /b 1
)

for /f %%v in ('node -e "process.stdout.write(process.versions.node)"') do set NODE_VER=%%v
echo   Node.js %NODE_VER%  OK

REM ── .env setup ──────────────────────────────────────────────────────────────
if not exist .env (
  echo.
  echo   First run: creating .env from .env.example
  copy .env.example .env >nul

  echo.
  echo   Paste your Anthropic API key below.
  echo   Get one at: https://console.anthropic.com/settings/keys
  echo.
  set /p AKEY="  ANTHROPIC_KEY: "

  if not "!AKEY!"=="" (
    powershell -Command "(Get-Content .env) -replace 'ANTHROPIC_KEY=sk-ant-api03-your-key-here', 'ANTHROPIC_KEY=!AKEY!' | Set-Content .env"
    echo   Key saved to .env  OK
  ) else (
    echo   No key entered — you can paste it in the app UI instead.
  )
)

REM ── Launch ───────────────────────────────────────────────────────────────────
echo.
echo   Starting server...
echo.
node server.js
pause
