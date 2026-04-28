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

$sdkDir = $env:ANDROID_HOME
if (-not $sdkDir) {
  $sdkDir = $env:ANDROID_SDK_ROOT
}
if (-not $sdkDir) {
  $sdkDir = Join-Path $env:LOCALAPPDATA "Android\Sdk"
}
if (-not (Test-Path $sdkDir)) {
  Write-Host "No encontre el Android SDK en $sdkDir" -ForegroundColor Red
  Write-Host "Abre Android Studio y confirma que Android SDK este instalado." -ForegroundColor Red
  exit 1
}

$localProperties = Join-Path $PSScriptRoot "android\local.properties"
$sdkDirForGradle = $sdkDir.Replace("\", "/")
Set-Content -Path $localProperties -Value "sdk.dir=$sdkDirForGradle" -Encoding ASCII
Write-Host "Android SDK: $sdkDirForGradle" -ForegroundColor DarkGray

Write-Host "Usando MuMu: $device" -ForegroundColor Green
Write-Host "Dispositivos finales:" -ForegroundColor Cyan
& $adb devices | Out-Host
Write-Host "Compilando APK debug para MuMu. La primera vez puede tardar varios minutos." -ForegroundColor Yellow

$env:NODE_ENV = "development"
Push-Location (Join-Path $PSScriptRoot "android")
try {
  .\gradlew.bat app:assembleDebug -x lint -x test -PreactNativeDevServerPort=8081 -PreactNativeArchitectures=x86_64 --console=plain
} finally {
  Pop-Location
}

$apk = Join-Path $PSScriptRoot "android\app\build\outputs\apk\debug\app-debug.apk"
if (-not (Test-Path $apk)) {
  Write-Host "No se genero el APK debug: $apk" -ForegroundColor Red
  exit 1
}

Write-Host "Instalando APK en MuMu..." -ForegroundColor Cyan
& $adb -s $device install -r $apk | Out-Host
& $adb -s $device reverse tcp:8081 tcp:8081 | Out-Null

Write-Host "Abriendo Proactivitis en MuMu..." -ForegroundColor Cyan
& $adb -s $device shell monkey -p com.proactivitis.app -c android.intent.category.LAUNCHER 1 | Out-Host

Write-Host ""
Write-Host "Listo. Ahora se abre Metro en esta ventana." -ForegroundColor Green
Write-Host "Deja esta ventana abierta; los cambios JS se refrescan en MuMu." -ForegroundColor Green

npx expo start --localhost --clear
