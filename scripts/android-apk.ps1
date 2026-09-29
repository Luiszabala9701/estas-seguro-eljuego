$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$toolRoot = Join-Path $env:LOCALAPPDATA 'Gamenigmatic\tools'
$jdkCandidates = @()
$jdkCandidates += Get-ChildItem -Directory -Path $toolRoot -Filter 'jdk-21*' -ErrorAction SilentlyContinue | Sort-Object Name -Descending | Select-Object -ExpandProperty FullName
$jdkCandidates += Get-ChildItem -Directory -Path 'C:\Program Files\Eclipse Adoptium' -Filter 'jdk-21*' -ErrorAction SilentlyContinue | Sort-Object Name -Descending | Select-Object -ExpandProperty FullName
if ($env:JAVA_HOME -and (Split-Path $env:JAVA_HOME -Leaf) -like 'jdk-21*') { $jdkCandidates += $env:JAVA_HOME }
$javaHome = $jdkCandidates | Where-Object { Test-Path -LiteralPath (Join-Path $_ 'bin\java.exe') } | Select-Object -First 1
if (-not $javaHome) { throw 'Java 21 no está disponible. Instalá Temurin 21 o guardalo en AppData\Local\Gamenigmatic\tools.' }

$env:JAVA_HOME = $javaHome
if (-not $env:ANDROID_HOME) { $env:ANDROID_HOME = Join-Path $env:LOCALAPPDATA 'Android\Sdk' }

Push-Location $projectRoot
try {
  npm run android:sync
  if ($LASTEXITCODE -ne 0) { throw 'Falló la sincronización de Capacitor.' }
  Push-Location (Join-Path $projectRoot 'android')
  try {
    .\gradlew.bat assembleDebug
    if ($LASTEXITCODE -ne 0) { throw 'Falló la compilación de la APK.' }
  } finally { Pop-Location }

  $sourceApk = Join-Path $projectRoot 'android\app\build\outputs\apk\debug\app-debug.apk'
  $outputDirectory = Join-Path $projectRoot 'output\android'
  New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
  Copy-Item -LiteralPath $sourceApk -Destination (Join-Path $outputDirectory 'Estas-seguro-1.2.0-debug.apk') -Force
} finally { Pop-Location }
