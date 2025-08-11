class ReporteActividadManager {
  constructor() {
    this.dataManager = new DataManager()
    this.initEventListeners()
  }

  initEventListeners() {
    const form = document.getElementById('form-reporte-actividad')
    const btnUbicacion = document.getElementById('btn-ubicacion-reporte')
    const checkboxTerminos = document.getElementById('acepto-terminos')
    const btnSubmit = form.querySelector('button[type="submit"]')

    form.addEventListener('submit', (e) => this.handleSubmit(e))
    btnUbicacion.addEventListener('click', () => this.obtenerUbicacion())
    checkboxTerminos.addEventListener('change', (e) => {
      btnSubmit.disabled = !e.target.checked
    })

    // Habilitar/deshabilitar botón según validación
    form.addEventListener('input', () => this.validarFormulario())
  }

  async handleSubmit(e) {
    e.preventDefault()

    if (!this.validarFormulario()) {
      this.mostrarMensaje('⚠️ Por favor completa todos los campos requeridos', 'error')
      return
    }

    const reporte = this.construirReporte()

    try {
      // Simular envío (en una app real, esto sería una API)
      await this.enviarReporte(reporte)

      // Guardar en localStorage para el administrador
      this.dataManager.guardarReporte(reporte)

      this.mostrarMensaje(
        '✅ Reporte enviado exitosamente. Número de referencia: ' + reporte.id,
        'exito'
      )
      this.limpiarFormulario()
    } catch (error) {
      console.error('Error al enviar reporte:', error)
      this.mostrarMensaje('❌ Error al enviar el reporte. Inténtalo nuevamente.', 'error')
    }
  }

  construirReporte() {
    const form = document.getElementById('form-reporte-actividad')
    const formData = new FormData(form)

    const reporte = {
      id: 'REP-' + Date.now(),
      tipo: document.getElementById('tipo-actividad').value,
      descripcion: document.getElementById('descripcion-actividad').value,
      ubicacion: document.getElementById('ubicacion-actividad').value,
      fecha_incidente: document.getElementById('fecha-actividad').value,
      personas_involucradas: document.getElementById('personas-involucradas').value,
      evidencia: document.getElementById('evidencia-descripcion').value,
      prioridad: document.getElementById('prioridad-reporte').value,

      // Información de contacto (opcional)
      nombre_reportante: document.getElementById('nombre-reportante').value,
      telefono_reportante: document.getElementById('telefono-reportante').value,
      email_reportante: document.getElementById('email-reportante').value,

      // Metadata
      fecha_reporte: new Date().toISOString(),
      estado: 'pendiente',
      ip_reportante: 'xxx.xxx.xxx.xxx', // En producción obtener IP real
      navegador: navigator.userAgent,
    }

    return reporte
  }

  async enviarReporte(reporte) {
    // Simular delay de envío
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('📤 Reporte enviado:', reporte)
        resolve()
      }, 1000)
    })
  }

  validarFormulario() {
    const tipoActividad = document.getElementById('tipo-actividad').value
    const descripcion = document.getElementById('descripcion-actividad').value
    const ubicacion = document.getElementById('ubicacion-actividad').value
    const prioridad = document.getElementById('prioridad-reporte').value
    const terminos = document.getElementById('acepto-terminos').checked

    return tipoActividad && descripcion.trim() && ubicacion.trim() && prioridad && terminos
  }

  obtenerUbicacion() {
    const btnUbicacion = document.getElementById('btn-ubicacion-reporte')
    const ubicacionInput = document.getElementById('ubicacion-actividad')

    btnUbicacion.textContent = ' Obteniendo ubicación...'
    btnUbicacion.disabled = true

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude

          try {
            btnUbicacion.textContent = ' Obteniendo dirección...'

            // Usar API de geocodificación inversa de OpenStreetMap (gratuita)
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=es`
            )

            if (response.ok) {
              const data = await response.json()

              // Construir dirección legible desde los datos obtenidos
              let direccion = ''

              if (data.address) {
                const addr = data.address
                const partes = []

                // Agregar diferentes partes de la dirección según disponibilidad
                if (addr.road || addr.street) partes.push(addr.road || addr.street)
                if (addr.house_number) partes.push(`#${addr.house_number}`)
                if (addr.neighbourhood || addr.suburb)
                  partes.push(addr.neighbourhood || addr.suburb)
                if (addr.city || addr.town || addr.village)
                  partes.push(addr.city || addr.town || addr.village)
                if (addr.state || addr.province) partes.push(addr.state || addr.province)
                if (addr.country) partes.push(addr.country)

                direccion = partes.join(', ')
              }

              // Si no se pudo construir una dirección, usar el display_name
              if (!direccion || direccion.length < 10) {
                direccion = data.display_name || `Ubicación: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
              }

              ubicacionInput.value = direccion
              this.mostrarMensaje('✅ Ubicación obtenida correctamente', 'exito')
              btnUbicacion.textContent = ' Ubicación obtenida'
            } else {
              throw new Error('Error en la respuesta del servicio')
            }
          } catch (error) {
            console.warn('Error obteniendo dirección, usando coordenadas:', error)
            // Fallback: usar coordenadas si falla la geocodificación inversa
            ubicacionInput.value = `Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
            this.mostrarMensaje('✅ Ubicación obtenida (coordenadas)', 'exito')
            btnUbicacion.textContent = ' Ubicación obtenida'
          }

          btnUbicacion.disabled = false
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error)
          this.mostrarMensaje(
            '⚠️ No se pudo obtener la ubicación. Ingresa la dirección manualmente.',
            'warning'
          )
          btnUbicacion.textContent = '📍 Usar mi ubicación'
          btnUbicacion.disabled = false
        }
      )
    } else {
      this.mostrarMensaje('⚠️ Tu navegador no soporta geolocalización', 'warning')
      btnUbicacion.textContent = '📍 No disponible'
      btnUbicacion.disabled = false
    }
  }

  limpiarFormulario() {
    const form = document.getElementById('form-reporte-actividad')
    form.reset()
    document.getElementById('acepto-terminos').checked = false
    form.querySelector('button[type="submit"]').disabled = true
  }

  mostrarMensaje(mensaje, tipo) {
    const contenedor = document.getElementById('mensaje-reporte')
    contenedor.className = `mensaje mensaje-${tipo}`
    contenedor.textContent = mensaje
    contenedor.style.display = 'block'

    setTimeout(() => {
      contenedor.style.display = 'none'
    }, 5000)
  }
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
  new ReporteActividadManager()
})
