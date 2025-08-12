# Script para actualizar todas las referencias en las páginas HTML

$pagesPath = "pages\"
$htmlFiles = Get-ChildItem -Path $pagesPath -Name "*.html"

Write-Host "Actualizando referencias en archivos HTML..."

foreach ($file in $htmlFiles) {
    $filePath = Join-Path $pagesPath $file
    Write-Host "Procesando: $file"
    
    # Leer contenido del archivo
    $content = Get-Content $filePath -Raw
    
    # Actualizar referencias CSS
    $content = $content -replace 'href="index\.css"', 'href="../assets/css/index.css"'
    
    # Actualizar referencias de imágenes
    $content = $content -replace 'src="img/', 'src="../assets/img/'
    
    # Actualizar referencias a index.html
    $content = $content -replace 'href="index\.html"', 'href="../index.html"'
    
    # Actualizar referencias de scripts
    $content = $content -replace 'src="dataManager\.js"', 'src="../assets/js/dataManager.js"'
    $content = $content -replace 'src="denuncia\.js"', 'src="../assets/js/denuncia.js"'
    $content = $content -replace 'src="consultar-caso\.js"', 'src="../assets/js/consultar-caso.js"'
    $content = $content -replace 'src="reportes\.js"', 'src="../assets/js/reportes.js"'
    
    # Guardar archivo actualizado
    Set-Content $filePath $content -Encoding UTF8
}

Write-Host "¡Referencias actualizadas en todas las páginas!"
