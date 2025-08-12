// Radar Migratorio - Script Principal
// Gestión de datos migratorios y visualizaciones

// Datos de migración por año y país
const datosMigratorios = {
  2025: {
    haiti: { masculino: 150, femenino: 120 },
    venezuela: { masculino: 130, femenino: 140 },
    evolucionMensual: [20, 30, 45, 40, 50, 65, 70, 80, 90, 100, 110, 120],
  },
  2024: {
    haiti: { masculino: 140, femenino: 110 },
    venezuela: { masculino: 115, femenino: 125 },
    evolucionMensual: [15, 25, 40, 35, 45, 60, 65, 75, 85, 95, 105, 115],
  },
  2023: {
    haiti: { masculino: 120, femenino: 90 },
    venezuela: { masculino: 100, femenino: 110 },
    evolucionMensual: [10, 20, 30, 25, 35, 50, 55, 65, 75, 85, 95, 105],
  },
}

function renderCharts() {
  const year = document.getElementById('anio')?.value || '2025'
  const origin = document.getElementById('origen')?.value || 'todos'
  const gender = document.getElementById('genero')?.value || 'todos'
  const datosDelAnio = datosMigratorios[year]

  // Gráfico de barras
  const ctxBarras = document.getElementById('barrasChart')?.getContext('2d')
  if (ctxBarras) {
    let labels = ['Haití', 'Venezuela']
    let masculino = [datosDelAnio.haiti.masculino, datosDelAnio.venezuela.masculino]
    let femenino = [datosDelAnio.haiti.femenino, datosDelAnio.venezuela.femenino]

    // Filtrar por país y género
    if (origin !== 'todos') {
      labels = [origin.charAt(0).toUpperCase() + origin.slice(1)]
      masculino = [datosDelAnio[origin].masculino]
      femenino = [datosDelAnio[origin].femenino]
    }
    if (gender === 'masculino') femenino = [0, 0]
    if (gender === 'femenino') masculino = [0, 0]

    // Destruir gráfico anterior si existe
    if (window.miGraficoDeBarras) window.miGraficoDeBarras.destroy()
    window.miGraficoDeBarras = new Chart(ctxBarras, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Masculino',
            data: masculino,
            backgroundColor: 'rgba(0,33,71,0.7)',
          },
          {
            label: 'Femenino',
            data: femenino,
            backgroundColor: 'rgba(215,38,61,0.7)',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          title: { display: true, text: `Migrantes por origen y género (${year})` },
        },
      },
    })
  }

  // Gráfico de líneas
  const ctxLineas = document.getElementById('lineasChart')?.getContext('2d')
  if (ctxLineas) {
    if (window.miGraficoDeLineas) window.miGraficoDeLineas.destroy()
    window.miGraficoDeLineas = new Chart(ctxLineas, {
      type: 'line',
      data: {
        labels: [
          'Ene',
          'Feb',
          'Mar',
          'Abr',
          'May',
          'Jun',
          'Jul',
          'Ago',
          'Sep',
          'Oct',
          'Nov',
          'Dic',
        ],
        datasets: [
          {
            label: `Evolución Mensual (${year})`,
            data: datosDelAnio.evolucionMensual,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: `Evolución Mensual de Flujos (${year})` },
          legend: { position: 'bottom' },
        },
      },
    })
  }
}

// Escuchadores para filtros
document.getElementById('anio')?.addEventListener('change', renderCharts)
document.getElementById('origen')?.addEventListener('change', renderCharts)
document.getElementById('genero')?.addEventListener('change', renderCharts)
document.getElementById('btn-buscar')?.addEventListener('click', renderCharts)
// Render inicial
renderCharts()
// ...existing code...

// IDIOMAS

document.getElementById('form-sospecha')?.addEventListener('submit', function (e) {
  e.preventDefault()
  const nombre = document.getElementById('nombre-sospecha').value.trim()
  const detalle = document.getElementById('detalle-sospecha').value.trim()

  if (!detalle) {
    mostrarMensaje('Por favor, describe la actividad sospechosa.', 'error')
    return
  }

  // Guardar en localStorage (opcional)
  const reporte = { nombre, detalle, fecha: new Date().toISOString() }
  const reportes = JSON.parse(localStorage.getItem('reportesSospecha')) || []
  reportes.push(reporte)
  localStorage.setItem('reportesSospecha', JSON.stringify(reportes))

  mostrarMensaje('¡Reporte enviado correctamente!', 'exito')
  this.reset()
})

// Función para mostrar mensajes
function mostrarMensaje(texto, tipo) {
  let mensaje = document.getElementById('mensaje-form-sospecha')
  if (!mensaje) {
    mensaje = document.createElement('div')
    mensaje.id = 'mensaje-form-sospecha'
    mensaje.style.marginTop = '1rem'
    mensaje.style.fontWeight = 'bold'
    document.getElementById('form-sospecha').appendChild(mensaje)
  }
  mensaje.textContent = texto
  mensaje.style.color = tipo === 'error' ? '#d7263d' : '#0066cc'
  setTimeout(() => (mensaje.textContent = ''), 3500)
}

document.getElementById('form-contacto')?.addEventListener('submit', function (e) {
  e.preventDefault()
  const nombre = document.getElementById('nombre-contacto').value.trim()
  const correo = document.getElementById('correo-contacto').value.trim()
  const mensaje = document.getElementById('mensaje-contacto').value.trim()

  if (!nombre || !correo || !mensaje) {
    mostrarMensajeContacto('Todos los campos son obligatorios.', 'error')
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    mostrarMensajeContacto('El correo no es válido.', 'error')
    return
  }

  mostrarMensajeContacto('¡Mensaje enviado correctamente!', 'exito')
  this.reset()
})

function mostrarMensajeContacto(texto, tipo) {
  let mensaje = document.getElementById('mensaje-form-contacto')
  if (!mensaje) {
    mensaje = document.createElement('div')
    mensaje.id = 'mensaje-form-contacto'
    mensaje.style.marginTop = '1rem'
    mensaje.style.fontWeight = 'bold'
    document.getElementById('form-contacto').appendChild(mensaje)
  }
  mensaje.textContent = texto
  mensaje.style.color = tipo === 'error' ? '#d7263d' : '#0066cc'
  setTimeout(() => (mensaje.textContent = ''), 3500)
}
