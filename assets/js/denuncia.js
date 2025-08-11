// Inicializar DataManager
const dataManager = new DataManager()

// Variable para almacenar la ubicación del usuario
let ubicacionUsuario = null

// Función para obtener ubicación del usuario
async function obtenerUbicacion() {
  const ubicacionInput = document.getElementById('ubicacion')
  const btnUbicacion = document.getElementById('btn-ubicacion')

  if (navigator.geolocation) {
    // Cambiar texto del botón mientras se obtiene la ubicación
    if (btnUbicacion) {
      btnUbicacion.textContent = '📍 Obteniendo ubicación...'
      btnUbicacion.disabled = true
    }

    navigator.geolocation.getCurrentPosition(
      async function (position) {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        ubicacionUsuario = { lat, lng }

        try {
          if (btnUbicacion) {
            btnUbicacion.textContent = '📍 Obteniendo dirección...'
          }

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
              if (addr.neighbourhood || addr.suburb) partes.push(addr.neighbourhood || addr.suburb)
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
            console.log('Ubicación obtenida:', { direccion, coordenadas: ubicacionUsuario })

            if (btnUbicacion) {
              btnUbicacion.textContent = '📍 Ubicación obtenida'
              btnUbicacion.disabled = false
            }
          } else {
            throw new Error('Error en la respuesta del servicio')
          }
        } catch (error) {
          console.warn('Error obteniendo dirección, usando coordenadas:', error)
          // Fallback: usar coordenadas si falla la geocodificación inversa
          ubicacionInput.value = `Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
          console.log('Ubicación obtenida (coordenadas):', ubicacionUsuario)

          if (btnUbicacion) {
            btnUbicacion.textContent = '📍 Ubicación obtenida'
            btnUbicacion.disabled = false
          }
        }
      },
      function (error) {
        console.log('Error obteniendo ubicación:', error)
        ubicacionInput.value = 'Ubicación no disponible'

        if (btnUbicacion) {
          btnUbicacion.textContent = '📍 Usar mi ubicación'
          btnUbicacion.disabled = false
        }
      }
    )
  } else {
    ubicacionInput.value = 'Geolocalización no soportada'

    if (btnUbicacion) {
      btnUbicacion.textContent = '📍 No disponible'
      btnUbicacion.disabled = true
    }
  }
}

// Función para validar el formulario en tiempo real
function validarFormulario() {
  const nombre = document.getElementById('nombre-denuncia').value.trim()
  const correo = document.getElementById('correo').value.trim()
  const detalle = document.getElementById('detalle-denuncia').value.trim()

  const submitBtn = document.getElementById('form-denuncia').querySelector('button[type="submit"]')

  if (nombre && correo && detalle && correo.includes('@')) {
    submitBtn.disabled = false
    submitBtn.style.opacity = '1'
  } else {
    submitBtn.disabled = true
    submitBtn.style.opacity = '0.6'
  }
}

// Obtener ubicación al cargar la página y configurar eventos
document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM cargado, iniciando configuración...')

  // Verificar que DataManager esté disponible
  if (typeof DataManager === 'undefined') {
    console.error('DataManager no está cargado')
    alert('Error: Sistema de datos no disponible')
    return
  }

  console.log('DataManager disponible:', dataManager)

  // Obtener ubicación inicial
  obtenerUbicacion()

  // Configurar validación en tiempo real
  const campos = ['nombre-denuncia', 'correo', 'detalle-denuncia']
  campos.forEach((campo) => {
    const elemento = document.getElementById(campo)
    if (elemento) {
      elemento.addEventListener('input', validarFormulario)
      elemento.addEventListener('blur', validarFormulario)
    }
  })

  // Validación inicial
  validarFormulario()

  // Agregar evento al botón de ubicación
  const btnUbicacion = document.getElementById('btn-ubicacion')
  if (btnUbicacion) {
    btnUbicacion.addEventListener('click', function () {
      console.log('Actualizando ubicación...')
      obtenerUbicacion()
    })
  }

  // Manejar envío del formulario
  const formulario = document.getElementById('form-denuncia')
  if (!formulario) {
    console.error('Formulario no encontrado')
    return
  }

  formulario.addEventListener('submit', function (e) {
    e.preventDefault()
    console.log('Formulario enviado')

    // Obtener datos del formulario
    const nombre = document.getElementById('nombre-denuncia').value.trim()
    const correo = document.getElementById('correo').value.trim()
    const detalle = document.getElementById('detalle-denuncia').value.trim()
    const ubicacion = document.getElementById('ubicacion').value.trim()
    const fecha = new Date().toISOString()

    console.log('Datos del formulario:', { nombre, correo, detalle, ubicacion })

    // Validación básica
    if (!detalle) {
      alert('Por favor, describe el incidente.')
      return
    }

    if (!nombre) {
      alert('Por favor, ingresa tu nombre.')
      return
    }

    if (!correo || !correo.includes('@')) {
      alert('Por favor, ingresa un correo válido.')
      return
    }

    // Generar número de caso único
    const numeroCaso =
      'RM-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase()

    console.log('Número de caso generado:', numeroCaso)

    // Crear objeto denuncia usando la estructura del DataManager
    const denuncia = {
      numeroCaso,
      nombre,
      correo,
      detalle,
      ubicacion: ubicacion || 'No especificada',
      coordenadas: ubicacionUsuario,
      fecha,
      estado: 'pendiente',
      prioridad: 'normal',
      fechaActualizacion: fecha,
      tipo: 'denuncia',
      categoria: 'general',
    }

    console.log('Objeto denuncia creado:', denuncia)

    try {
      // Guardar denuncia usando DataManager
      console.log('Intentando guardar denuncia...')
      const resultado = dataManager.agregarDenuncia(denuncia)
      console.log('Resultado del guardado:', resultado)

      if (resultado.success) {
        // Mostrar mensaje de éxito
        alert(
          `Denuncia registrada exitosamente.\nNúmero de caso: ${numeroCaso}\n\nGuarda este número para consultar el estado de tu caso.`
        )

        // Limpiar formulario
        formulario.reset()

        // Obtener nueva ubicación para el siguiente uso
        obtenerUbicacion()

        // Validar formulario después del reset
        validarFormulario()

        // Opcional: Redirigir a página de consulta después de 3 segundos
        setTimeout(() => {
          if (confirm('¿Deseas consultar el estado de tu caso ahora?')) {
            window.location.href = 'consultar-caso.html'
          }
        }, 2000)
      } else {
        console.error('Error en el resultado:', resultado)
        alert('Error al registrar la denuncia: ' + resultado.message)
      }
    } catch (error) {
      console.error('Error al guardar denuncia:', error)
      alert('Error interno al procesar la denuncia. Intenta nuevamente.')
    }
  })
})

// Función para mostrar denuncias anteriores del usuario
function mostrarDenunciasUsuario() {
  const denuncias = dataManager.obtenerDenuncias()

  // Crear contenedor para denuncias si no existe
  let contenedorDenuncias = document.getElementById('denuncias-usuario')
  if (!contenedorDenuncias) {
    contenedorDenuncias = document.createElement('div')
    contenedorDenuncias.id = 'denuncias-usuario'
    contenedorDenuncias.className = 'denuncias-lista'

    // Insertar después del formulario
    const formulario = document.querySelector('.denuncia-formulario')
    if (formulario && formulario.parentNode) {
      formulario.parentNode.insertBefore(contenedorDenuncias, formulario.nextSibling)
    }
  }

  if (denuncias.length === 0) {
    contenedorDenuncias.innerHTML = `
      <div class="sin-denuncias">
        <h4>📋 Sin denuncias previas</h4>
        <p>Cuando envíes una denuncia, aparecerá aquí para que puedas hacer seguimiento.</p>
      </div>
    `
    return
  }

  // Ordenar por fecha más reciente
  denuncias.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

  const denunciasHTML = denuncias
    .map((denuncia) => {
      const fecha = new Date(denuncia.fecha).toLocaleDateString('es-DO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

      return `
      <div class="denuncia-item estado-${denuncia.estado}">
        <div class="denuncia-header">
          <span class="numero-caso">📋 ${denuncia.numeroCaso}</span>
          <span class="fecha-denuncia">📅 ${fecha}</span>
        </div>
        
        <div class="estado-denuncia estado-${denuncia.estado}">
          ${
            denuncia.estado === 'pendiente'
              ? '🔄 Pendiente'
              : denuncia.estado === 'procesando'
              ? '⚙️ En Proceso'
              : '✅ Resuelto'
          }
        </div>
        
        <div class="denuncia-detalle">
          ${denuncia.detalle}
        </div>
        
        <div class="denuncia-info">
          <div class="info-item">
            <strong>👤 Denunciante:</strong> ${denuncia.nombre}
          </div>
          <div class="info-item">
            <strong>📧 Correo:</strong> ${denuncia.correo}
          </div>
          <div class="info-item">
            <strong>🏷️ Prioridad:</strong> ${denuncia.prioridad}
          </div>
          <div class="info-item">
            <strong>📍 Ubicación:</strong> ${denuncia.ubicacion}
          </div>
        </div>
        
        ${
          denuncia.coordenadas
            ? `
          <div class="ubicacion-coordenadas">
            🌍 <strong>Coordenadas:</strong> ${denuncia.coordenadas.lat}, ${denuncia.coordenadas.lng}
          </div>
        `
            : ''
        }
      </div>
    `
    })
    .join('')

  contenedorDenuncias.innerHTML = `
    <h3>📋 Tus Denuncias Anteriores (${denuncias.length})</h3>
    ${denunciasHTML}
  `
}
