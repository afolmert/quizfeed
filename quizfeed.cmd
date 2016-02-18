@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "app.js" %*
) ELSE (
  @SETLOCAL
  @SET PATHEXT=%PATHEXT:;.JS;=;%
  node  "app.js" %*
)