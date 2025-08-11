// Inicializar DataManager con manejo de errores
let dataManager = null

try {
  dataManager = new DataManager()
} catch (error) {
  console.error('Error al inicializar DataManager:', error)
  // Fallback: crear un objeto básico si DataManager no está disponible
  dataManager = {
    getDenuncias: () => [],
    getEstadisticas: () => ({ total: 0, pendientes: 0, procesadas: 0, cerradas: 0 }),
  }
}

// Función para mostrar errores al usuario
function mostrarError(mensaje, error = null) {
  if (error) {
    console.error('Error detallado:', error)
  }

  // Crear elemento de error si no existe
  let errorDiv = document.getElementById('error-mensaje')
  if (!errorDiv) {
    errorDiv = document.createElement('div')
    errorDiv.id = 'error-mensaje'
    errorDiv.style.cssText = `
      background-color: #f8d7da;
      color: #721c24;
      padding: 10px;
      margin: 10px 0;
      border: 1px solid #f5c6cb;
      border-radius: 4px;
      display: block;
    `
    // Insertar al inicio del body o en el container principal
    const container = document.querySelector('.login-container') || document.body
    container.insertBefore(errorDiv, container.firstChild)
  }

  errorDiv.textContent = mensaje
  errorDiv.style.display = 'block'

  // Ocultar error después de 5 segundos
  setTimeout(() => {
    if (errorDiv) {
      errorDiv.style.display = 'none'
    }
  }, 5000)
}

// Función para ocultar mensajes de error
function ocultarError() {
  const errorDiv = document.getElementById('error-mensaje')
  if (errorDiv) {
    errorDiv.style.display = 'none'
  }
}

document.addEventListener('DOMContentLoaded', function () {
  try {
    // Si estamos en la página de login
    if (document.getElementById('admin-login')) {
      document.getElementById('admin-login').addEventListener('submit', function (e) {
        e.preventDefault()

        try {
          ocultarError() // Limpiar errores previos

          const usuario = document.getElementById('usuario').value.trim()
          const password = document.getElementById('password').value.trim()

          // Validar que los campos no estén vacíos
          if (!usuario || !password) {
            mostrarError('Por favor, completa todos los campos')
            return
          }

          // Credenciales simples (en un sistema real usarías autenticación segura)
          if (usuario === 'admin' && password === 'admin123') {
            try {
              localStorage.setItem('adminLoggedin', 'true')
              window.location.href = 'admin-dashboard.html'
            } catch (storageError) {
              mostrarError(
                'Error al guardar sesión. Verifica que las cookies estén habilitadas.',
                storageError
              )
            }
          } else {
            mostrarError('Credenciales incorrectas. Usuario: admin, Contraseña: admin123')
          }
        } catch (loginError) {
          mostrarError('Error durante el inicio de sesión. Inténtalo de nuevo.', loginError)
        }
      })
    }

    // Si estamos en el dashboard
    if (document.querySelector('.admin-content')) {
      verificarAutenticacion()
      cargarEstadisticas()
      cargarDenuncias()
      cargarDenunciasEliminadas()
      cargarReportes()
      cargarNoticias()

      // Auto-actualizar denuncias cada 30 segundos
      setInterval(() => {
        cargarEstadisticas()
        cargarDenuncias()
        cargarDenunciasEliminadas()
      }, 30000)

      // Logout
      document.getElementById('logout').addEventListener('click', function () {
        localStorage.removeItem('adminLoggedin')
        window.location.href = 'admin-login.html'
      })

      // Filtro de denuncias
      document.getElementById('estado-filtro').addEventListener('change', function () {
        cargarDenuncias()
      })

      // Configurar formulario de noticias
      document.getElementById('form-nueva-noticia')?.addEventListener('submit', function (e) {
        e.preventDefault()

        const titulo = document.getElementById('titulo-noticia').value.trim()
        const contenido = document.getElementById('contenido-noticia').value.trim()
        const tipo = document.getElementById('tipo-noticia').value

        if (!titulo || !contenido) {
          alert('Por favor, completa todos los campos')
          return
        }

        const noticia = {
          id: Date.now(),
          titulo,
          contenido,
          tipo,
          fecha: new Date().toISOString(),
          activa: true,
        }

        // Guardar noticia usando DataManager
        try {
          const resultado = dataManager.agregarNoticia(noticia)
          if (resultado.success) {
            alert('Noticia publicada exitosamente')
            this.reset()
            cargarNoticias()
          } else {
            alert('Error al publicar la noticia: ' + resultado.message)
          }
        } catch (error) {
          console.error('Error al guardar noticia:', error)
          alert('Error interno al publicar la noticia')
        }
      })
    }
  } catch (initError) {
    console.error('Error al inicializar el panel de administración:', initError)
    mostrarError('Error al cargar el panel de administración. Recarga la página.', initError)
  }
})

function verificarAutenticacion() {
  try {
    if (!localStorage.getItem('adminLoggedin')) {
      window.location.href = 'admin-login.html'
    }
  } catch (error) {
    console.error('Error al verificar autenticación:', error)
    // En caso de error, redirigir al login por seguridad
    window.location.href = 'admin-login.html'
  }
}

function mostrarSeccion(seccion) {
  // Ocultar todas las secciones
  document.querySelectorAll('.admin-section').forEach((section) => {
    section.classList.remove('active')
  })

  // Mostrar la sección seleccionada
  document.getElementById(seccion + '-admin').classList.add('active')
}

function cargarEstadisticas() {
  try {
    // Obtener estadísticas usando DataManager
    const stats = dataManager.obtenerEstadisticas()

    document.getElementById('stats-container').innerHTML = `
        <div class="stat-card">
            <h3>Total Denuncias</h3>
            <p>${stats.totalDenuncias}</p>
        </div>
        <div class="stat-card">
            <h3>Pendientes</h3>
            <p>${stats.denunciasPendientes}</p>
        </div>
        <div class="stat-card">
            <h3>En Proceso</h3>
            <p>${stats.denunciasEnProceso}</p>
        </div>
        <div class="stat-card">
            <h3>Resueltas</h3>
            <p>${stats.denunciasResueltas}</p>
        </div>
        <div class="stat-card">
            <h3>Reportes Sospecha</h3>
            <p>${stats.totalReportes}</p>
        </div>
        <div class="stat-card">
            <h3>Denuncias Hoy</h3>
            <p>${stats.denunciasHoy}</p>
        </div>
    `
  } catch (error) {
    console.error('Error al cargar estadísticas:', error)
    const statsContainer = document.getElementById('stats-container')
    if (statsContainer) {
      statsContainer.innerHTML =
        '<div class="error">Error al cargar estadísticas. Recarga la página.</div>'
    }
  }
}

function cargarDenuncias() {
  console.log('=== INICIANDO CARGA DE DENUNCIAS ===')

  try {
    // Verificar que DataManager esté disponible
    if (!dataManager) {
      console.error('DataManager no está disponible')
      return
    }

    // Obtener denuncias usando DataManager
    const filtro = document.getElementById('estado-filtro')?.value || 'todas'
    console.log('Filtro seleccionado:', filtro)

    let denuncias = dataManager.obtenerDenuncias()
    console.log('Denuncias obtenidas del DataManager:', denuncias)
    console.log('Número total de denuncias:', denuncias.length)

    // Aplicar filtro
    if (filtro !== 'todas') {
      denuncias = dataManager.filtrarDenuncias({ estado: filtro })
      console.log('Denuncias después del filtro:', denuncias)
    }

    const container = document.getElementById('lista-denuncias')
    console.log('Contenedor encontrado:', container)

    if (!container) {
      console.error('Contenedor lista-denuncias no encontrado')
      return
    }

    if (denuncias.length === 0) {
      container.innerHTML = `
        <div class="sin-denuncias">
          <h3>📋 No hay denuncias para mostrar</h3>
          <p>Las denuncias aparecerán aquí cuando se registren desde el formulario.</p>
          <p><small>Filtro actual: <strong>${
            filtro === 'todas' ? 'Todas las denuncias' : filtro
          }</strong></small></p>
        </div>`
      return
    }

    // Mostrar contador de denuncias
    const totalText =
      filtro === 'todas'
        ? `📊 Total: ${denuncias.length} denuncias`
        : `📊 ${denuncias.length} denuncias con estado: ${filtro}`

    // Ordenar denuncias por fecha (más recientes primero)
    denuncias.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

    container.innerHTML =
      `
      <div class="denuncias-counter">
        ${totalText} | Última actualización: ${new Date().toLocaleTimeString('es-DO')}
      </div>
    ` +
      denuncias
        .map((denuncia, index) => {
          const fechaFormateada = new Date(denuncia.fecha).toLocaleString('es-DO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })

          const estadoClass = `estado-${denuncia.estado}`
          const prioridadClass = `prioridad-${denuncia.prioridad}`

          return `
            <div class="denuncia-card ${estadoClass} ${prioridadClass}">
                <div class="denuncia-header">
                    <h4>Caso: ${denuncia.numeroCaso}</h4>
                    <span class="denuncia-fecha">${fechaFormateada}</span>
                </div>
                
                <div class="denuncia-info">
                    <div class="info-basica">
                        <p><strong>👤 Denunciante:</strong> ${denuncia.nombre || 'Anónimo'}</p>
                        <p><strong>📧 Correo:</strong> ${denuncia.correo || 'No proporcionado'}</p>
                        <p><strong>📍 Ubicación:</strong> ${denuncia.ubicacion}</p>
                        <p><strong>🏷️ Categoría:</strong> ${denuncia.categoria || 'General'}</p>
                    </div>
                    
                    <div class="info-estado">
                        <p><strong>Estado:</strong> <span class="badge ${estadoClass}">${
            denuncia.estado
          }</span></p>
                        <p><strong>Prioridad:</strong> <span class="badge ${prioridadClass}">${
            denuncia.prioridad
          }</span></p>
                    </div>
                </div>
                
                <div class="denuncia-detalle">
                    <p><strong>📝 Detalle:</strong></p>
                    <div class="detalle-texto">${denuncia.detalle}</div>
                </div>
                
                ${
                  denuncia.coordenadas
                    ? `
                <div class="coordenadas-info">
                    <p><strong>🌍 Coordenadas:</strong> ${denuncia.coordenadas.lat}, ${denuncia.coordenadas.lng}</p>
                    <button onclick="verEnMapa(${denuncia.coordenadas.lat}, ${denuncia.coordenadas.lng})" class="btn-mapa">Ver en Mapa</button>
                </div>`
                    : ''
                }
                
                <div class="acciones">
                    <div class="acciones-row">
                        <label>Estado:</label>
                        <select class="estado-select" onchange="cambiarEstadoDenuncia('${
                          denuncia.numeroCaso
                        }', this.value)">
                            <option value="pendiente" ${
                              denuncia.estado === 'pendiente' ? 'selected' : ''
                            }>🔄 Pendiente</option>
                            <option value="procesando" ${
                              denuncia.estado === 'procesando' ? 'selected' : ''
                            }>⚙️ En Proceso</option>
                            <option value="resuelto" ${
                              denuncia.estado === 'resuelto' ? 'selected' : ''
                            }>✅ Resuelto</option>
                        </select>
                    </div>
                    
                    <div class="acciones-row">
                        <label>Prioridad:</label>
                        <select class="prioridad-select" onchange="cambiarPrioridadDenuncia('${
                          denuncia.numeroCaso
                        }', this.value)">
                            <option value="baja" ${
                              denuncia.prioridad === 'baja' ? 'selected' : ''
                            }>🟢 Baja</option>
                            <option value="normal" ${
                              denuncia.prioridad === 'normal' ? 'selected' : ''
                            }>🟡 Normal</option>
                            <option value="alta" ${
                              denuncia.prioridad === 'alta' ? 'selected' : ''
                            }>🟠 Alta</option>
                            <option value="urgente" ${
                              denuncia.prioridad === 'urgente' ? 'selected' : ''
                            }>🔴 Urgente</option>
                        </select>
                    </div>
                    
                    <div class="acciones-botones">
                        <button class="btn-contactar" onclick="contactarDenunciante('${
                          denuncia.correo
                        }', '${denuncia.numeroCaso}')">📧 Contactar</button>
                        <button class="btn-eliminar" onclick="eliminarDenuncia('${
                          denuncia.numeroCaso
                        }')">🗑️ Eliminar</button>
                    </div>
                </div>
                
                <div class="denuncia-footer">
                    <small>Última actualización: ${new Date(
                      denuncia.fechaActualizacion
                    ).toLocaleString('es-DO')}</small>
                </div>
            </div>
        `
        })
        .join('')

    console.log(`${denuncias.length} denuncias cargadas en el admin`)
  } catch (error) {
    console.error('Error al cargar denuncias:', error)
    const container = document.getElementById('lista-denuncias')
    if (container) {
      container.innerHTML = `
        <div class="error">
          <h3>❌ Error al cargar denuncias</h3>
          <p>Ha ocurrido un error al cargar las denuncias. Por favor, recarga la página.</p>
          <button onclick="cargarDenuncias()" class="btn-retry">🔄 Reintentar</button>
        </div>`
    }
  }
}

function cambiarEstadoDenuncia(numeroCaso, nuevoEstado) {
  const resultado = dataManager.actualizarDenuncia(numeroCaso, {
    estado: nuevoEstado,
    fechaActualizacion: new Date().toISOString(),
  })

  if (resultado.success) {
    cargarDenuncias()
    cargarEstadisticas()
  } else {
    alert('Error al actualizar el estado: ' + resultado.message)
  }
}

function cambiarPrioridadDenuncia(numeroCaso, nuevaPrioridad) {
  const resultado = dataManager.actualizarDenuncia(numeroCaso, {
    prioridad: nuevaPrioridad,
    fechaActualizacion: new Date().toISOString(),
  })

  if (resultado.success) {
    cargarDenuncias()
    cargarEstadisticas()
  } else {
    alert('Error al actualizar la prioridad: ' + resultado.message)
  }
}

function eliminarDenuncia(numeroCaso) {
  if (!confirm(`¿Estás seguro de que quieres mover la denuncia ${numeroCaso} a la papelera?`)) {
    return
  }

  // Pedir razón de eliminación
  const razon = prompt(
    'Ingresa la razón por la cual eliminas esta denuncia:',
    'Caso cerrado/resuelto'
  )

  if (razon === null) {
    return // Usuario canceló
  }

  try {
    const resultado = dataManager.eliminarDenuncia(numeroCaso, razon || 'Sin especificar')

    if (resultado.success) {
      alert(`✅ ${resultado.message}`)
      cargarDenuncias()
      cargarEstadisticas()
      cargarDenunciasEliminadas() // Actualizar papelera también
    } else {
      alert(`❌ Error: ${resultado.message}`)
    }
  } catch (error) {
    console.error('Error al eliminar denuncia:', error)
    alert('❌ Error interno al eliminar la denuncia')
  }
}

// Función para cargar noticias
function cargarNoticias() {
  const noticias = dataManager.obtenerNoticias()
  const container = document.getElementById('lista-noticias')

  if (!container) return

  if (noticias.length === 0) {
    container.innerHTML = '<p>No hay noticias publicadas.</p>'
    return
  }

  container.innerHTML = noticias
    .map(
      (noticia) => `
      <div class="noticia-card">
        <h4>${noticia.titulo}</h4>
        <p><strong>Tipo:</strong> ${noticia.tipo}</p>
        <p><strong>Fecha:</strong> ${new Date(noticia.fecha).toLocaleDateString()}</p>
        <p>${noticia.contenido}</p>
        <div class="acciones">
          <button class="btn-eliminar" onclick="eliminarNoticia('${noticia.id}')">Eliminar</button>
        </div>
      </div>
    `
    )
    .join('')
}

function eliminarNoticia(id) {
  if (confirm('¿Estás seguro de eliminar esta noticia?')) {
    const resultado = dataManager.eliminarNoticia(id)

    if (resultado.success) {
      cargarNoticias()
    } else {
      alert('Error al eliminar la noticia: ' + resultado.message)
    }
  }
}

// === FUNCIONES ADICIONALES PARA DENUNCIAS ===

function verEnMapa(lat, lng) {
  const url = `https://www.google.com/maps?q=${lat},${lng}`
  window.open(url, '_blank')
}

function contactarDenunciante(correo, numeroCaso) {
  const asunto = `Seguimiento a caso ${numeroCaso} - Radar Migratorio`
  const cuerpo = `Estimado/a denunciante,\n\nNos ponemos en contacto con usted en relación al caso ${numeroCaso} que fue reportado en nuestro sistema.\n\n[Escriba aquí su mensaje]\n\nSaludos cordiales,\nEquipo Radar Migratorio RD`

  const mailtoLink = `mailto:${correo}?subject=${encodeURIComponent(
    asunto
  )}&body=${encodeURIComponent(cuerpo)}`
  window.location.href = mailtoLink
}

function exportarDenuncias() {
  const denuncias = dataManager.obtenerDenuncias()

  if (denuncias.length === 0) {
    alert('No hay denuncias para exportar')
    return
  }

  // Convertir a CSV
  const headers = [
    'Número de Caso',
    'Nombre',
    'Correo',
    'Fecha',
    'Estado',
    'Prioridad',
    'Ubicación',
    'Detalle',
  ]
  const csvContent = [
    headers.join(','),
    ...denuncias.map((d) =>
      [
        d.numeroCaso,
        `"${d.nombre || ''}"`,
        d.correo || '',
        new Date(d.fecha).toLocaleDateString(),
        d.estado,
        d.prioridad,
        `"${d.ubicacion || ''}"`,
        `"${d.detalle.replace(/"/g, '""')}"`,
      ].join(',')
    ),
  ].join('\n')

  // Descargar archivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `denuncias_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}

// ===== FUNCIONES PARA GESTIÓN DE PAPELERA =====

function cargarDenunciasEliminadas() {
  console.log('=== CARGANDO DENUNCIAS ELIMINADAS ===')

  try {
    if (!dataManager) {
      console.error('DataManager no está disponible')
      return
    }

    const denunciasEliminadas = dataManager.obtenerDenunciasEliminadas()
    console.log('Denuncias eliminadas obtenidas:', denunciasEliminadas)

    const container = document.getElementById('lista-denuncias-eliminadas')

    if (!container) {
      console.error('Contenedor lista-denuncias-eliminadas no encontrado')
      return
    }

    if (denunciasEliminadas.length === 0) {
      container.innerHTML = `
        <div class="sin-denuncias">
          <h3>🗑️ Papelera vacía</h3>
          <p>No hay denuncias eliminadas.</p>
          <p><small>Las denuncias eliminadas aparecerán aquí y podrás restaurarlas o eliminarlas permanentemente.</small></p>
        </div>`
      return
    }

    // Ordenar por fecha de eliminación (más recientes primero)
    denunciasEliminadas.sort((a, b) => new Date(b.fechaEliminacion) - new Date(a.fechaEliminacion))

    container.innerHTML =
      `
      <div class="denuncias-counter">
        🗑️ ${
          denunciasEliminadas.length
        } denuncias en papelera | Última actualización: ${new Date().toLocaleTimeString('es-DO')}
      </div>
    ` +
      denunciasEliminadas
        .map((denuncia, index) => {
          const fechaFormateada = new Date(denuncia.fecha).toLocaleString('es-DO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })

          const fechaEliminacion = new Date(denuncia.fechaEliminacion).toLocaleString('es-DO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })

          return `
          <div class="denuncia-card denuncia-eliminada">
            <div class="denuncia-header">
              <h4>🗑️ Caso: ${denuncia.numeroCaso}</h4>
              <span class="denuncia-fecha">Eliminada: ${fechaEliminacion}</span>
            </div>
            
            <div class="info-eliminacion">
              <p><strong>🚮 Razón de eliminación:</strong> ${denuncia.razonEliminacion}</p>
              <p><strong>👤 Eliminado por:</strong> ${denuncia.eliminadoPor}</p>
              <p><strong>📅 Fecha original:</strong> ${fechaFormateada}</p>
            </div>
            
            <div class="denuncia-info">
              <div class="info-basica">
                <p><strong>👤 Denunciante:</strong> ${denuncia.nombre || 'Anónimo'}</p>
                <p><strong>📧 Correo:</strong> ${denuncia.correo || 'No proporcionado'}</p>
                <p><strong>📍 Ubicación:</strong> ${denuncia.ubicacion}</p>
                <p><strong>🏷️ Estado original:</strong> ${denuncia.estado}</p>
              </div>
            </div>
            
            <div class="denuncia-detalle">
              <p><strong>📝 Detalle:</strong></p>
              <div class="detalle-texto">${denuncia.detalle}</div>
            </div>
            
            <div class="acciones acciones-papelera">
              <div class="acciones-botones">
                <button onclick="restaurarDenuncia('${denuncia.numeroCaso}')" class="btn-restaurar">
                  ↩️ Restaurar
                </button>
                <button onclick="eliminarPermanentemente('${
                  denuncia.numeroCaso
                }')" class="btn-eliminar-permanente">
                  🗑️ Eliminar Permanentemente
                </button>
              </div>
            </div>
          </div>
        `
        })
        .join('')

    console.log(`${denunciasEliminadas.length} denuncias eliminadas cargadas`)
  } catch (error) {
    console.error('Error al cargar denuncias eliminadas:', error)
    const container = document.getElementById('lista-denuncias-eliminadas')
    if (container) {
      container.innerHTML = `
        <div class="error">
          <h3>❌ Error al cargar papelera</h3>
          <p>Ha ocurrido un error al cargar las denuncias eliminadas.</p>
          <button onclick="cargarDenunciasEliminadas()" class="btn-retry">🔄 Reintentar</button>
        </div>`
    }
  }
}

function restaurarDenuncia(numeroCaso) {
  if (!confirm(`¿Estás seguro de que quieres restaurar la denuncia ${numeroCaso}?`)) {
    return
  }

  try {
    const resultado = dataManager.restaurarDenuncia(numeroCaso)

    if (resultado.success) {
      alert(`✅ ${resultado.message}`)
      cargarDenunciasEliminadas()
      cargarDenuncias()
      cargarEstadisticas()
    } else {
      alert(`❌ Error: ${resultado.message}`)
    }
  } catch (error) {
    console.error('Error al restaurar denuncia:', error)
    alert('❌ Error interno al restaurar la denuncia')
  }
}

function eliminarPermanentemente(numeroCaso) {
  if (
    !confirm(
      `⚠️ ¿Estás seguro de que quieres eliminar PERMANENTEMENTE la denuncia ${numeroCaso}?\n\nEsta acción NO se puede deshacer.`
    )
  ) {
    return
  }

  // Doble confirmación para eliminación permanente
  if (
    !confirm(
      `🚨 CONFIRMACIÓN FINAL: Se eliminará permanentemente la denuncia ${numeroCaso}.\n\n¿Continuar?`
    )
  ) {
    return
  }

  try {
    const resultado = dataManager.eliminarPermanentemente(numeroCaso)

    if (resultado.success) {
      alert(`✅ ${resultado.message}`)
      cargarDenunciasEliminadas()
    } else {
      alert(`❌ Error: ${resultado.message}`)
    }
  } catch (error) {
    console.error('Error al eliminar permanentemente:', error)
    alert('❌ Error interno al eliminar la denuncia')
  }
}

function vaciarPapelera() {
  const denunciasEliminadas = dataManager.obtenerDenunciasEliminadas()

  if (denunciasEliminadas.length === 0) {
    alert('ℹ️ La papelera ya está vacía')
    return
  }

  if (
    !confirm(
      `⚠️ ¿Estás seguro de que quieres VACIAR COMPLETAMENTE la papelera?\n\nSe eliminarán PERMANENTEMENTE ${denunciasEliminadas.length} denuncias.\n\nEsta acción NO se puede deshacer.`
    )
  ) {
    return
  }

  // Doble confirmación para vaciar papelera
  if (
    !confirm(
      `🚨 CONFIRMACIÓN FINAL: Se eliminarán permanentemente ${denunciasEliminadas.length} denuncias.\n\n¿Continuar?`
    )
  ) {
    return
  }

  try {
    const resultado = dataManager.vaciarPapelera()

    if (resultado.success) {
      alert(`✅ ${resultado.message}`)
      cargarDenunciasEliminadas()
    } else {
      alert(`❌ Error: ${resultado.message}`)
    }
  } catch (error) {
    console.error('Error al vaciar papelera:', error)
    alert('❌ Error interno al vaciar la papelera')
  }
}

// === GESTIÓN DE REPORTES DE ACTIVIDAD SOSPECHOSA ===

function cargarReportes() {
  console.log('=== INICIANDO CARGA DE REPORTES ===')
  console.log('DataManager disponible:', !!dataManager)

  try {
    if (!dataManager) {
      console.error('❌ DataManager no está disponible')
      const container = document.getElementById('lista-reportes')
      if (container) {
        container.innerHTML = `
          <div class="error-reportes">
            <h3>❌ Error: DataManager no disponible</h3>
            <p>El sistema de gestión de datos no se ha inicializado correctamente.</p>
            <button onclick="location.reload()" class="btn-retry">🔄 Recargar página</button>
          </div>`
      }
      return
    }

    // Verificar si existe la función obtenerReportes
    if (typeof dataManager.obtenerReportes !== 'function') {
      console.error('❌ La función obtenerReportes no existe en DataManager')
      const container = document.getElementById('lista-reportes')
      if (container) {
        container.innerHTML = `
          <div class="error-reportes">
            <h3>❌ Error: Función obtenerReportes no encontrada</h3>
            <p>El DataManager no tiene la función para obtener reportes.</p>
            <button onclick="location.reload()" class="btn-retry">🔄 Recargar página</button>
          </div>`
      }
      return
    }

    const reportes = dataManager.obtenerReportes()
    console.log('Reportes obtenidos del DataManager:', reportes)
    console.log('Tipo de reportes:', typeof reportes)
    console.log('Es array:', Array.isArray(reportes))
    console.log('Número total de reportes:', reportes ? reportes.length : 'undefined')

    const container = document.getElementById('lista-reportes')
    console.log('Contenedor encontrado:', !!container)

    if (!container) {
      console.error('❌ Contenedor lista-reportes no encontrado en el DOM')
      return
    }

    // Verificar localStorage directamente
    const reportesLS = localStorage.getItem('radarMigratorio_reportes')
    console.log('Reportes en localStorage:', reportesLS)

    if (!reportes || reportes.length === 0) {
      console.log('📝 No hay reportes, mostrando mensaje por defecto')
      container.innerHTML = `
        <div class="sin-reportes">
          <h3>📋 No hay reportes de actividad sospechosa</h3>
          <p>Los reportes aparecerán aquí cuando los ciudadanos los envíen desde el formulario.</p>
          <p><small>Los reportes se reciben desde: <strong>páginas/reporte-actividad.html</strong></small></p>
          <hr>
          <p><strong>🔧 Información de depuración:</strong></p>
          <p>• DataManager disponible: ${!!dataManager}</p>
          <p>• Función obtenerReportes disponible: ${typeof dataManager.obtenerReportes}</p>
          <p>• Reportes en localStorage: ${reportesLS ? 'Sí' : 'No'}</p>
          <p>• Longitud de reportes: ${reportes ? reportes.length : 'undefined'}</p>
          <hr>
          <button onclick="location.href='../test-reportes.html'" class="btn-refresh">🧪 Ir a página de pruebas</button>
        </div>`
      return
    }

    // Ordenar reportes por fecha (más recientes primero)
    reportes.sort((a, b) => new Date(b.fecha_reporte) - new Date(a.fecha_reporte))

    // Crear filtros si no existen
    if (
      !container.previousElementSibling ||
      !container.previousElementSibling.classList.contains('filtros-reportes')
    ) {
      const filtrosHtml = `
        <div class="filtros-reportes">
          <label for="estado-filtro-reportes">Estado:</label>
          <select id="estado-filtro-reportes" onchange="filtrarReportes()">
            <option value="todos">Todos los estados</option>
            <option value="pendiente">⏳ Pendiente</option>
            <option value="en_revision">👀 En Revisión</option>
            <option value="en_investigacion">🔍 En Investigación</option>
            <option value="resuelto">✅ Resuelto</option>
            <option value="archivado">📁 Archivado</option>
          </select>
          
          <label for="prioridad-filtro-reportes">Prioridad:</label>
          <select id="prioridad-filtro-reportes" onchange="filtrarReportes()">
            <option value="todas">Todas las prioridades</option>
            <option value="urgente">🔴 Urgente</option>
            <option value="alta">🟠 Alta</option>
            <option value="media">🟡 Media</option>
            <option value="baja">🟢 Baja</option>
          </select>
          
          <button onclick="cargarReportes()" class="btn-refresh">🔄 Actualizar</button>
        </div>
      `
      container.insertAdjacentHTML('beforebegin', filtrosHtml)
    }

    const totalText = `📊 Total: ${reportes.length} reportes de actividad sospechosa`

    container.innerHTML =
      `
      <div class="reportes-counter">
        ${totalText} | Última actualización: ${new Date().toLocaleTimeString('es-DO')}
      </div>
    ` +
      reportes
        .map((reporte, index) => {
          const fechaFormateada = new Date(reporte.fecha_reporte).toLocaleString('es-DO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })

          const fechaIncidente = reporte.fecha_incidente
            ? new Date(reporte.fecha_incidente).toLocaleString('es-DO')
            : 'No especificada'

          const estadoClass = `estado-${reporte.estado}`
          const prioridadClass = `prioridad-${reporte.prioridad}`
          const tipoTexto = getTipoReporteTexto(reporte.tipo)
          const estadoTexto = getEstadoReporteTexto(reporte.estado)
          const prioridadTexto = getPrioridadReporteTexto(reporte.prioridad)

          return `
        <div class="reporte-card ${estadoClass} ${prioridadClass}">
          <div class="reporte-header">
            <div class="reporte-id">📋 ID: ${reporte.id}</div>
            <div class="reporte-badges">
              <span class="badge badge-tipo">${tipoTexto}</span>
              <span class="badge badge-estado">${estadoTexto}</span>
              <span class="badge badge-prioridad">${prioridadTexto}</span>
            </div>
          </div>
          
          <div class="reporte-content">
            <div class="reporte-info">
              <p><strong>📅 Fecha del reporte:</strong> ${fechaFormateada}</p>
              <p><strong>⏰ Fecha del incidente:</strong> ${fechaIncidente}</p>
              <p><strong>📍 Ubicación:</strong> ${reporte.ubicacion}</p>
              <p><strong>📝 Descripción:</strong></p>
              <div class="descripcion-completa">${reporte.descripcion}</div>
              
              ${
                reporte.personas_involucradas
                  ? `
                <p><strong>👥 Personas involucradas:</strong></p>
                <div class="personas-involucradas">${reporte.personas_involucradas}</div>
              `
                  : ''
              }
              
              ${
                reporte.evidencia
                  ? `
                <p><strong>🔍 Evidencia disponible:</strong></p>
                <div class="evidencia-info">${reporte.evidencia}</div>
              `
                  : ''
              }
            </div>
            
            ${
              reporte.nombre_reportante || reporte.telefono_reportante || reporte.email_reportante
                ? `
              <div class="contacto-reportante">
                <h4>👤 Información de contacto (confidencial)</h4>
                ${
                  reporte.nombre_reportante
                    ? `<p><strong>Nombre:</strong> ${reporte.nombre_reportante}</p>`
                    : ''
                }
                ${
                  reporte.telefono_reportante
                    ? `<p><strong>Teléfono:</strong> ${reporte.telefono_reportante}</p>`
                    : ''
                }
                ${
                  reporte.email_reportante
                    ? `<p><strong>Email:</strong> ${reporte.email_reportante}</p>`
                    : ''
                }
              </div>
            `
                : '<p class="anonimo">📵 Reporte anónimo - Sin información de contacto</p>'
            }
          </div>
          
          <div class="reporte-acciones">
            <select onchange="cambiarEstadoReporte('${
              reporte.id
            }', this.value)" class="estado-selector">
              <option value="pendiente" ${
                reporte.estado === 'pendiente' ? 'selected' : ''
              }>⏳ Pendiente</option>
              <option value="en_revision" ${
                reporte.estado === 'en_revision' ? 'selected' : ''
              }>👀 En Revisión</option>
              <option value="en_investigacion" ${
                reporte.estado === 'en_investigacion' ? 'selected' : ''
              }>🔍 En Investigación</option>
              <option value="resuelto" ${
                reporte.estado === 'resuelto' ? 'selected' : ''
              }>✅ Resuelto</option>
              <option value="archivado" ${
                reporte.estado === 'archivado' ? 'selected' : ''
              }>📁 Archivado</option>
            </select>
            
            <button onclick="verDetallesReporte('${
              reporte.id
            }')" class="btn-ver">👁️ Ver Detalles</button>
            <button onclick="eliminarReporte('${
              reporte.id
            }')" class="btn-eliminar">🗑️ Eliminar</button>
          </div>
        </div>
      `
        })
        .join('')

    console.log('✅ Reportes cargados exitosamente')
  } catch (error) {
    console.error('❌ Error al cargar reportes:', error)
    const container = document.getElementById('lista-reportes')
    if (container) {
      container.innerHTML = `
        <div class="error-reportes">
          <h3>❌ Error al cargar reportes</h3>
          <p>Ha ocurrido un error: ${error.message}</p>
          <button onclick="cargarReportes()" class="btn-retry">🔄 Reintentar</button>
        </div>`
    }
  }
}

function filtrarReportes() {
  const estadoFiltro = document.getElementById('estado-filtro-reportes')?.value || 'todos'
  const prioridadFiltro = document.getElementById('prioridad-filtro-reportes')?.value || 'todas'

  const filtros = {}

  if (estadoFiltro !== 'todos') {
    filtros.estado = estadoFiltro
  }

  if (prioridadFiltro !== 'todas') {
    filtros.prioridad = prioridadFiltro
  }

  const reportes = dataManager.obtenerReportes(filtros)
  console.log('Reportes filtrados:', reportes)

  // Actualizar la vista con los reportes filtrados
  // (simplificado: recargar con filtros)
  cargarReportes()
}

function cambiarEstadoReporte(id, nuevoEstado) {
  try {
    const resultado = dataManager.actualizarReporte(id, { estado: nuevoEstado })

    if (resultado) {
      console.log(`✅ Estado del reporte ${id} cambiado a: ${nuevoEstado}`)
      // Actualizar la vista
      cargarReportes()
      cargarEstadisticas()
    } else {
      alert('❌ Error al cambiar el estado del reporte')
    }
  } catch (error) {
    console.error('Error al cambiar estado:', error)
    alert('❌ Error al cambiar el estado: ' + error.message)
  }
}

function verDetallesReporte(id) {
  const reporte = dataManager.obtenerReportePorId(id)

  if (!reporte) {
    alert('❌ Reporte no encontrado')
    return
  }

  const detalles = `
📋 DETALLES DEL REPORTE: ${reporte.id}

🏷️ Tipo: ${getTipoReporteTexto(reporte.tipo)}
📊 Estado: ${getEstadoReporteTexto(reporte.estado)}
🚨 Prioridad: ${getPrioridadReporteTexto(reporte.prioridad)}

📅 Fecha del reporte: ${new Date(reporte.fecha_reporte).toLocaleString('es-DO')}
⏰ Fecha del incidente: ${
    reporte.fecha_incidente
      ? new Date(reporte.fecha_incidente).toLocaleString('es-DO')
      : 'No especificada'
  }

📍 Ubicación: ${reporte.ubicacion}

📝 Descripción:
${reporte.descripcion}

${
  reporte.personas_involucradas
    ? `👥 Personas involucradas:\n${reporte.personas_involucradas}\n`
    : ''
}
${reporte.evidencia ? `🔍 Evidencia:\n${reporte.evidencia}\n` : ''}

${
  reporte.nombre_reportante || reporte.telefono_reportante || reporte.email_reportante
    ? `👤 CONTACTO (CONFIDENCIAL):\n${
        reporte.nombre_reportante ? `Nombre: ${reporte.nombre_reportante}\n` : ''
      }${reporte.telefono_reportante ? `Teléfono: ${reporte.telefono_reportante}\n` : ''}${
        reporte.email_reportante ? `Email: ${reporte.email_reportante}\n` : ''
      }`
    : '📵 REPORTE ANÓNIMO'
}

🌐 Información técnica:
IP: ${reporte.ip_reportante || 'No disponible'}
Navegador: ${reporte.navegador || 'No disponible'}
  `

  alert(detalles)
}

function eliminarReporte(id) {
  if (
    !confirm(
      `⚠️ ¿Estás seguro de que quieres eliminar el reporte ${id}?\n\nEsta acción no se puede deshacer.`
    )
  ) {
    return
  }

  try {
    dataManager.eliminarReporte(id)
    alert(`✅ Reporte ${id} eliminado correctamente`)
    cargarReportes()
    cargarEstadisticas()
  } catch (error) {
    console.error('Error al eliminar reporte:', error)
    alert('❌ Error al eliminar el reporte: ' + error.message)
  }
}

// Funciones auxiliares para reportes
function getTipoReporteTexto(tipo) {
  const tipos = {
    'documentos-falsos': '📄 Documentos Falsos',
    'trafico-personas': '🚶 Tráfico de Personas',
    'trabajo-irregular': '💼 Trabajo Irregular',
    'establecimiento-irregular': '🏢 Establecimiento Irregular',
    corrupcion: '⚖️ Corrupción',
    otro: '📝 Otro',
  }
  return tipos[tipo] || tipo
}

function getEstadoReporteTexto(estado) {
  const estados = {
    pendiente: '⏳ Pendiente',
    en_revision: '👀 En Revisión',
    en_investigacion: '🔍 En Investigación',
    resuelto: '✅ Resuelto',
    archivado: '📁 Archivado',
  }
  return estados[estado] || estado
}

function getPrioridadReporteTexto(prioridad) {
  const prioridades = {
    baja: '🟢 Baja',
    media: '🟡 Media',
    alta: '🟠 Alta',
    urgente: '🔴 Urgente',
  }
  return prioridades[prioridad] || prioridad
}
