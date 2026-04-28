$ErrorActionPreference = "Stop"

Write-Host "Abriendo Proactivitis instalado en MuMu..." -ForegroundColor Cyan

$adbCandidates = @(
  "adb",
  "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe",
  "$env:ANDROID_HOME\platform-tools\adb.exe",
  "$env:ANDROID_SDK_ROOT\platform-tools\adb.exe"
) | Where-Object { $_ -and $_.Trim().Length -gt 0 }

$adb = $null
foreach ($candidate in $adbCandidates) {
  try {
    $command = Get-Command $candidate -ErrorAction Stop
    $adb = $command.Source
    break
  } catch {
    if (Test-Path $candidate) {
      $adb = $candidate
      break
    }
  }
}

if (-not $adb) {
  Write-Host "No encontre ADB. Abre Android Studio una vez o instala Android Platform Tools." -ForegroundColor Red
  exit 1
}

& $adb start-server | Out-Null

$ports = @("127.0.0.1:7555", "127.0.0.1:16384", "127.0.0.1:16416")
$device = $null
foreach ($port in $ports) {
  $result = (& $adb connect $port) -join "`n"
  if ($result -match "connected|already connected") {
    $device = $port
    break
  }
}

if (-not $device) {
  $deviceLines = (& $adb devices) | Where-Object { $_ -match "\sdevice$" }
  if ($deviceLines.Count -gt 0) {
    $device = ($deviceLines[0] -split "\s+")[0]
  }
}

if (-not $device) {
  Write-Host "No encontre MuMu. Abre MuMu y ejecuta este script otra vez." -ForegroundColor Red
  exit 1
}

Write-Host "Usando MuMu: $device" -ForegroundColor Green
& $adb -s $device shell monkey -p com.proactivitis.app -c android.intent.category.LAUNCHER 1 | Out-Host
Write-Host "Listo. Esto solo abre la app instalada, no compila ni instala APK." -ForegroundColor Green
