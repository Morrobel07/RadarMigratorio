# Script de Reorganización Automática
# Ejecutar en PowerShell desde la carpeta raíz del proyecto

Write-Host "🚀 Iniciando reorganización de Radar Migratorio..." -ForegroundColor Green

# Crear nuevas carpetas
Write-Host "📁 Creando estructura de carpetas..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "assets\css" | Out-Null
New-Item -ItemType Directory -Force -Path "assets\js" | Out-Null
New-Item -ItemType Directory -Force -Path "assets\images" | Out-Null
New-Item -ItemType Directory -Force -Path "assets\docs" | Out-Null
New-Item -ItemType Directory -Force -Path "pages" | Out-Null

# Mover archivos CSS
Write-Host "🎨 Moviendo archivos CSS..." -ForegroundColor Yellow
if (Test-Path "RadarMigratorio\index.css") {
    Move-Item "RadarMigratorio\index.css" "assets\css\main.css"
}

# Mover archivos JavaScript
Write-Host "⚡ Moviendo archivos JavaScript..." -ForegroundColor Yellow
if (Test-Path "RadarMigratorio\dataManager.js") {
    Move-Item "RadarMigratorio\dataManager.js" "assets\js\dataManager.js"
}
if (Test-Path "RadarMigratorio\denuncia.js") {
    Move-Item "RadarMigratorio\denuncia.js" "assets\js\denuncia.js"
}
if (Test-Path "RadarMigratorio\consultar-caso.js") {
    Move-Item "RadarMigratorio\consultar-caso.js" "assets\js\consulta.js"
}
if (Test-Path "RadarMigratorio\reportes.js") {
    Move-Item "RadarMigratorio\reportes.js" "assets\js\reportes.js"
}
if (Test-Path "RadarMigratorio\index.js") {
    Move-Item "RadarMigratorio\index.js" "assets\js\home.js"
}

# Mover imágenes
Write-Host "🖼️ Moviendo imágenes..." -ForegroundColor Yellow
if (Test-Path "RadarMigratorio\img") {
    Move-Item "RadarMigratorio\img\*" "assets\images\"
    Remove-Item "RadarMigratorio\img" -Force
}
if (Test-Path "img") {
    Move-Item "img\*" "assets\images\"
    Remove-Item "img" -Force
}

# Mover documentos
Write-Host "📄 Moviendo documentos..." -ForegroundColor Yellow
if (Test-Path "RadarMigratorio\Qui.pdf") {
    Move-Item "RadarMigratorio\Qui.pdf" "assets\docs\guia-usuario.pdf"
}
if (Test-Path "Qui.pdf") {
    Move-Item "Qui.pdf" "assets\docs\guia-usuario-backup.pdf"
}

# Mover páginas HTML
Write-Host "📄 Moviendo páginas HTML..." -ForegroundColor Yellow
if (Test-Path "RadarMigratorio\denuncia.html") {
    Move-Item "RadarMigratorio\denuncia.html" "pages\denuncia.html"
}
if (Test-Path "RadarMigratorio\consultar-caso.html") {
    Move-Item "RadarMigratorio\consultar-caso.html" "pages\consultar-caso.html"
}
if (Test-Path "RadarMigratorio\reportes.html") {
    Move-Item "RadarMigratorio\reportes.html" "pages\reportes.html"
}
if (Test-Path "RadarMigratorio\alerta-estafas.html") {
    Move-Item "RadarMigratorio\alerta-estafas.html" "pages\alerta-estafas.html"
}
if (Test-Path "RadarMigratorio\noticia-regularizacion.html") {
    Move-Item "RadarMigratorio\noticia-regularizacion.html" "pages\regularizacion.html"
}

# Mover página principal
Write-Host "🏠 Moviendo página principal..." -ForegroundColor Yellow
if (Test-Path "RadarMigratorio\index.html") {
    Move-Item "RadarMigratorio\index.html" "index.html"
}

# Organizar admin
Write-Host "👨‍💼 Organizando panel admin..." -ForegroundColor Yellow
if (Test-Path "admin\admin-login.html") {
    Rename-Item "admin\admin-login.html" "login.html"
}
if (Test-Path "admin\admin-dashboard.html") {
    Rename-Item "admin\admin-dashboard.html" "dashboard.html"
}

# Limpiar carpetas vacías
Write-Host "🧹 Limpiando carpetas vacías..." -ForegroundColor Yellow
if ((Get-ChildItem "RadarMigratorio" -Force | Measure-Object).Count -eq 0) {
    Remove-Item "RadarMigratorio" -Force -Recurse
}

Write-Host "✅ Reorganización completada!" -ForegroundColor Green
Write-Host "📋 Siguiente paso: Actualizar rutas en archivos HTML" -ForegroundColor Cyan
