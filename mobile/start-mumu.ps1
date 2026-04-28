$ErrorActionPreference = "Continue"

Write-Host "Iniciando Proactivitis en MuMu con recarga en vivo..." -ForegroundColor Cyan

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
  Write-Host "No encontre ADB. Instala Android Platform Tools o abre Android Studio una vez." -ForegroundColor Red
  exit 1
}

Write-Host "ADB: $adb" -ForegroundColor DarkGray

Write-Host "Reiniciando ADB..."
& $adb kill-server | Out-Null
Start-Sleep -Seconds 1
& $adb start-server | Out-Host

$ports = @("127.0.0.1:7555", "127.0.0.1:16384", "127.0.0.1:16416")
$connectedDevice = $null
foreach ($port in $ports) {
  Write-Host "Probando MuMu en $port..."
  $result = (& $adb connect $port) -join "`n"
  Write-Host $result
  if ($result -match "connected|already connected") {
    $connectedDevice = $port
  }
}

Write-Host "Dispositivos detectados:" -ForegroundColor Cyan
& $adb devices | Out-Host

if (-not $connectedDevice) {
  $deviceLines = (& $adb devices) | Where-Object { $_ -match "\sdevice$" }
  if ($deviceLines.Count -gt 0) {
    $connectedDevice = ($deviceLines[0] -split "\s+")[0]
  }
}

if (-not $connectedDevice) {
  Write-Host "MuMu esta abierto, pero ADB no logro conectarse. Reinicia MuMu y ejecuta este comando otra vez." -ForegroundColor Red
  exit 1
}

$env:ANDROID_SERIAL = $connectedDevice
Write-Host "Usando dispositivo: $env:ANDROID_SERIAL" -ForegroundColor Green

Write-Host ""
Write-Host "Si MuMu esta abierto, Expo intentara abrir la app ahi." -ForegroundColor Green
Write-Host "Deja esta ventana abierta. Cada cambio en el codigo se vera con recarga en vivo." -ForegroundColor Green
Write-Host ""

npx expo start --android --clear
