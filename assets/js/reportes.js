document.addEventListener('DOMContentLoaded', function () {
  // Establecer fechas por defecto
  const hoy = new Date().toISOString().split('T')[0]
  const haceUnMes = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  document.getElementById('fecha-inicio').value = haceUnMes
  document.getElementById('fecha-fin').value = hoy

  actualizarPreview()

  // Event listeners
  document.getElementById('fecha-inicio').addEventListener('change', actualizarPreview)
  document.getElementById('fecha-fin').addEventListener('change', actualizarPreview)
  document.getElementById('estado-reporte').addEventListener('change', actualizarPreview)
  document.getElementById('btn-generar-pdf').addEventListener('click', generarPDF)
  document.getElementById('btn-exportar-excel').addEventListener('click', exportarExcel)
})

function actualizarPreview() {
  const fechaInicio = document.getElementById('fecha-inicio').value
  const fechaFin = document.getElementById('fecha-fin').value
  const estado = document.getElementById('estado-reporte').value

  const denuncias = JSON.parse(localStorage.getItem('denuncias')) || []

  const denunciasFiltradas = denuncias.filter((d) => {
    const fechaDenuncia = new Date(d.fecha).toISOString().split('T')[0]
    const cumpleFecha = fechaDenuncia >= fechaInicio && fechaDenuncia <= fechaFin
    const cumpleEstado = estado === 'todos' || d.estado === estado
    return cumpleFecha && cumpleEstado
  })

  const contenidoDiv = document.getElementById('contenido-reporte')

  if (denunciasFiltradas.length === 0) {
    contenidoDiv.innerHTML = '<p>No se encontraron denuncias con los filtros seleccionados.</p>'
    return
  }

  let html = `
    <div class="resumen-estadistico">
      <h4>Resumen Estadístico</h4>
      <p><strong>Total de denuncias:</strong> ${denunciasFiltradas.length}</p>
      <p><strong>Pendientes:</strong> ${
        denunciasFiltradas.filter((d) => d.estado === 'pendiente').length
      }</p>
      <p><strong>En investigación:</strong> ${
        denunciasFiltradas.filter((d) => d.estado === 'investigando').length
      }</p>
      <p><strong>Resueltas:</strong> ${
        denunciasFiltradas.filter((d) => d.estado === 'resuelto').length
      }</p>
    </div>
    <div class="lista-denuncias">
      <h4>Detalle de Denuncias</h4>
      <table class="tabla-reporte">
        <thead>
          <tr>
            <th>Número de Caso</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Ubicación</th>
            <th>Prioridad</th>
          </tr>
        </thead>
        <tbody>
  `

  denunciasFiltradas.forEach((d) => {
    html += `
      <tr>
        <td>${d.numeroCaso}</td>
        <td>${new Date(d.fecha).toLocaleDateString()}</td>
        <td>${d.estado}</td>
        <td>${d.ubicacion || 'No especificada'}</td>
        <td>${d.prioridad || 'Normal'}</td>
      </tr>
    `
  })

  html += `
        </tbody>
      </table>
    </div>
  `

  contenidoDiv.innerHTML = html
}

function generarPDF() {
  const { jsPDF } = window.jspdf
  const doc = new jsPDF()

  const fechaInicio = document.getElementById('fecha-inicio').value
  const fechaFin = document.getElementById('fecha-fin').value
  const estado = document.getElementById('estado-reporte').value

  const denuncias = JSON.parse(localStorage.getItem('denuncias')) || []
  const denunciasFiltradas = denuncias.filter((d) => {
    const fechaDenuncia = new Date(d.fecha).toISOString().split('T')[0]
    const cumpleFecha = fechaDenuncia >= fechaInicio && fechaDenuncia <= fechaFin
    const cumpleEstado = estado === 'todos' || d.estado === estado
    return cumpleFecha && cumpleEstado
  })

  // Título
  doc.setFontSize(16)
  doc.text('Reporte de Denuncias - Radar Migratorio RD', 20, 20)

  // Fecha del reporte
  doc.setFontSize(10)
  doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 20, 30)
  doc.text(`Período: ${fechaInicio} a ${fechaFin}`, 20, 40)

  // Resumen
  doc.setFontSize(12)
  doc.text('Resumen Estadístico:', 20, 60)
  doc.setFontSize(10)
  doc.text(`Total de denuncias: ${denunciasFiltradas.length}`, 20, 70)
  doc.text(
    `Pendientes: ${denunciasFiltradas.filter((d) => d.estado === 'pendiente').length}`,
    20,
    80
  )
  doc.text(
    `En investigación: ${denunciasFiltradas.filter((d) => d.estado === 'investigando').length}`,
    20,
    90
  )
  doc.text(
    `Resueltas: ${denunciasFiltradas.filter((d) => d.estado === 'resuelto').length}`,
    20,
    100
  )

  // Lista de denuncias
  let y = 120
  doc.setFontSize(12)
  doc.text('Detalle de Denuncias:', 20, y)
  y += 10

  doc.setFontSize(9)
  denunciasFiltradas.forEach((d, index) => {
    if (y > 270) {
      doc.addPage()
      y = 20
    }
    doc.text(
      `${index + 1}. ${d.numeroCaso} - ${new Date(d.fecha).toLocaleDateString()} - ${d.estado}`,
      20,
      y
    )
    y += 10
  })

  doc.save(`reporte-denuncias-${fechaInicio}-${fechaFin}.pdf`)
}

function exportarExcel() {
  const fechaInicio = document.getElementById('fecha-inicio').value
  const fechaFin = document.getElementById('fecha-fin').value
  const estado = document.getElementById('estado-reporte').value

  const denuncias = JSON.parse(localStorage.getItem('denuncias')) || []
  const denunciasFiltradas = denuncias.filter((d) => {
    const fechaDenuncia = new Date(d.fecha).toISOString().split('T')[0]
    const cumpleFecha = fechaDenuncia >= fechaInicio && fechaDenuncia <= fechaFin
    const cumpleEstado = estado === 'todos' || d.estado === estado
    return cumpleFecha && cumpleEstado
  })

  let csv = 'Número de Caso,Fecha,Estado,Ubicación,Prioridad,Detalle\n'

  denunciasFiltradas.forEach((d) => {
    csv += `"${d.numeroCaso}","${new Date(d.fecha).toLocaleDateString()}","${d.estado}","${
      d.ubicacion || 'No especificada'
    }","${d.prioridad || 'Normal'}","${d.detalle.replace(/"/g, '""')}"\n`
  })

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `reporte-denuncias-${fechaInicio}-${fechaFin}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}
