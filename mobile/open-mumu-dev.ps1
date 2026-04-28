$ErrorActionPreference = "Stop"

Write-Host "Preparando Proactivitis para MuMu..." -ForegroundColor Cyan

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

& $adb kill-server | Out-Null
Start-Sleep -Seconds 1
& $adb start-server | Out-Host

$ports = @("127.0.0.1:7555", "127.0.0.1:16416", "127.0.0.1:16384")
$device = $null
foreach ($port in $ports) {
  $result = (& $adb connect $port) -join "`n"
  Write-Host $result
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
  Write-Host "No encontre MuMu por ADB. Abre MuMu y ejecuta este comando otra vez." -ForegroundColor Red
  exit 1
}

$deviceLines = (& $adb devices) | Where-Object { $_ -match "\sdevice$" }
foreach ($line in $deviceLines) {
  $serial = ($line -split "\s+")[0]
  if ($serial -like "emulator-*" -and $serial -ne $device) {
    Write-Host "Quitando alias ADB conflictivo: $serial" -ForegroundColor Yellow
    & $adb disconnect $serial | Out-Host
  }
}

$env:ANDROID_SERIAL = $device
$env:EXPO_PUBLIC_API_BASE_URL = "https://proactivitis.com"

Write-Host "Usando MuMu: $device" -ForegroundColor Green
Write-Host "Dispositivos finales:" -ForegroundColor Cyan
& $adb devices | Out-Host
Write-Host "Instalando/abriendo la app local. La primera vez puede tardar varios minutos." -ForegroundColor Yellow
Write-Host "Cuando termine, deja esta ventana abierta para ver cambios en vivo." -ForegroundColor Green

npx expo run:android
