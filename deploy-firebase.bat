@echo off
setlocal
cd /d %~dp0

echo ==========================================
echo CGU Plan - Deploy Firebase
echo Projeto: cgu-plan
echo ==========================================
echo.

where firebase >nul 2>nul
if errorlevel 1 (
  echo Firebase CLI nao encontrado.
  echo Instale com: npm install -g firebase-tools
  echo.
  pause
  exit /b 1
)

firebase use cgu-plan
if errorlevel 1 goto :erro

firebase deploy --only hosting,firestore:rules
if errorlevel 1 goto :erro

echo.
echo Deploy concluido.
pause
exit /b 0

:erro
echo.
echo O deploy falhou. Veja a mensagem acima.
pause
exit /b 1
