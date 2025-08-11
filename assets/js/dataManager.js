/**
 * Sistema de Gestión de Datos para Radar Migratorio
 * Maneja denuncias, reportes, usuarios y configuración
 */

class DataManager {
  constructor() {
    this.storagePrefix = 'radarMigratorio_'
    this.version = '1.0'
    this.initializeStorage()
  }

  // Inicializar estructura de datos
  initializeStorage() {
    const defaultData = {
      denuncias: [],
      denunciasEliminadas: [], // Nueva estructura para papelera
      reportesSospecha: [], // Reportes de actividad sospechosa
      reportes: [], // Nuevo: para manejar reportes generales
      usuarios: [{ id: 1, username: 'admin', password: 'admin123', role: 'admin' }],
      configuracion: {
        version: this.version,
        ultimaActualizacion: new Date().toISOString(),
        contadorCasos: 1,
        contadorReportes: 1,
      },
      estadisticas: {
        totalDenuncias: 0,
        denunciasPendientes: 0,
        denunciasResueltas: 0,
        totalReportes: 0,
        reportesPendientes: 0,
        ultimoReporte: null,
      },
    }

    // Verificar si existe data previa
    Object.keys(defaultData).forEach((key) => {
      if (!this.get(key)) {
        this.set(key, defaultData[key])
      }
    })

    // Agregar datos de ejemplo si no hay denuncias
    this.initializeSampleData()
  }

  // Agregar datos de ejemplo para testing
  initializeSampleData() {
    const denunciasExistentes = this.obtenerDenuncias()

    if (denunciasExistentes.length === 0) {
      const denunciasEjemplo = [
        {
          numeroCaso: 'RM-1723334400000-ABCD',
          nombre: 'Juan Pérez',
          correo: 'juan.perez@email.com',
          detalle:
            'Actividad sospechosa en la frontera. Personal no autorizado solicitando documentos.',
          ubicacion: 'Lat: 18.456789, Lng: -69.123456',
          coordenadas: { lat: 18.456789, lng: -69.123456 },
          fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 días atrás
          estado: 'pendiente',
          prioridad: 'alta',
          fechaActualizacion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          tipo: 'denuncia',
          categoria: 'frontera',
        },
        {
          numeroCaso: 'RM-1723248000000-EFGH',
          nombre: 'María García',
          correo: 'maria.garcia@email.com',
          detalle:
            'Estafa telefónica relacionada con trámites migratorios. Solicitan dinero por procesos oficiales.',
          ubicacion: 'Lat: 18.489123, Lng: -69.987654',
          coordenadas: { lat: 18.489123, lng: -69.987654 },
          fecha: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 día atrás
          estado: 'procesando',
          prioridad: 'normal',
          fechaActualizacion: new Date().toISOString(),
          tipo: 'denuncia',
          categoria: 'estafa',
        },
        {
          numeroCaso: 'RM-1723161600000-IJKL',
          nombre: 'Carlos Rodríguez',
          correo: 'carlos.rodriguez@email.com',
          detalle:
            'Irregularidades en oficina migratoria. Funcionarios solicitando pagos no oficiales.',
          ubicacion: 'Santo Domingo, DN',
          coordenadas: null,
          fecha: new Date().toISOString(), // Hoy
          estado: 'resuelto',
          prioridad: 'urgente',
          fechaActualizacion: new Date().toISOString(),
          tipo: 'denuncia',
          categoria: 'corrupcion',
        },
      ]

      // Agregar cada denuncia de ejemplo
      denunciasEjemplo.forEach((denuncia) => {
        this.agregarDenuncia(denuncia)
      })

      console.log('Datos de ejemplo agregados:', denunciasEjemplo.length, 'denuncias')
    }
  }

  // Métodos básicos de almacenamiento
  get(key) {
    try {
      const data = localStorage.getItem(this.storagePrefix + key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error(`Error al leer ${key}:`, error)
      return null
    }
  }

  set(key, value) {
    try {
      localStorage.setItem(this.storagePrefix + key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`Error al guardar ${key}:`, error)
      return false
    }
  }

  // Métodos específicos para denuncias
  agregarDenuncia(denunciaData) {
    const denuncias = this.get('denuncias') || []
    const configuracion = this.get('configuracion')

    // Generar número de caso único
    const numeroCaso = `RM-${Date.now()}-${configuracion.contadorCasos.toString().padStart(4, '0')}`

    // Crear objeto denuncia completo
    const denuncia = {
      id: this.generateId(),
      numeroCaso,
      nombre: denunciaData.nombre || 'Anónimo',
      correo: denunciaData.correo || '',
      detalle: denunciaData.detalle,
      ubicacion: denunciaData.ubicacion || 'No especificada',
      coordenadas: denunciaData.coordenadas || null,
      fecha: new Date().toISOString(),
      estado: 'pendiente',
      prioridad: denunciaData.prioridad || 'normal',
      fechaActualizacion: new Date().toISOString(),
      observaciones: '',
      asignadoA: null,
      tags: [],
      adjuntos: [],
    }

    denuncias.push(denuncia)

    // Actualizar contador
    configuracion.contadorCasos++
    configuracion.ultimaActualizacion = new Date().toISOString()

    // Guardar
    this.set('denuncias', denuncias)
    this.set('configuracion', configuracion)
    this.actualizarEstadisticas()

    console.log('Denuncia guardada exitosamente:', denuncia)
    return { success: true, denuncia: denuncia, numeroCaso: numeroCaso }
  }

  buscarDenuncia(numeroCaso) {
    const denuncias = this.get('denuncias') || []
    return denuncias.find((d) => d.numeroCaso === numeroCaso)
  }

  // Obtener todas las denuncias
  obtenerDenuncias() {
    return this.get('denuncias') || []
  }

  // Obtener denuncia por ID
  obtenerDenuncia(id) {
    const denuncias = this.get('denuncias') || []
    return denuncias.find((d) => d.id === id)
  }

  actualizarEstadoDenuncia(numeroCaso, nuevoEstado, observaciones = '') {
    const denuncias = this.get('denuncias') || []
    const index = denuncias.findIndex((d) => d.numeroCaso === numeroCaso)

    if (index !== -1) {
      denuncias[index].estado = nuevoEstado
      denuncias[index].fechaActualizacion = new Date().toISOString()
      if (observaciones) {
        denuncias[index].observaciones = observaciones
      }

      this.set('denuncias', denuncias)
      this.actualizarEstadisticas()
      return { success: true, denuncia: denuncias[index] }
    }
    return { success: false, message: 'Denuncia no encontrada' }
  }

  // Función general para actualizar cualquier campo de una denuncia
  actualizarDenuncia(numeroCaso, datosActualizacion) {
    const denuncias = this.get('denuncias') || []
    const index = denuncias.findIndex((d) => d.numeroCaso === numeroCaso)

    if (index !== -1) {
      // Actualizar campos proporcionados
      Object.keys(datosActualizacion).forEach((key) => {
        denuncias[index][key] = datosActualizacion[key]
      })

      // Siempre actualizar la fecha de modificación
      denuncias[index].fechaActualizacion = new Date().toISOString()

      this.set('denuncias', denuncias)
      this.actualizarEstadisticas()
      return { success: true, denuncia: denuncias[index] }
    }
    return { success: false, message: 'Denuncia no encontrada' }
  }

  // Mover denuncia a papelera (eliminación suave)
  eliminarDenuncia(numeroCaso, razonEliminacion = 'Sin especificar') {
    const denuncias = this.get('denuncias') || []
    const denunciasEliminadas = this.get('denunciasEliminadas') || []

    const denunciaIndex = denuncias.findIndex((d) => d.numeroCaso === numeroCaso)

    if (denunciaIndex !== -1) {
      const denunciaEliminada = { ...denuncias[denunciaIndex] }

      // Agregar información de eliminación
      denunciaEliminada.fechaEliminacion = new Date().toISOString()
      denunciaEliminada.razonEliminacion = razonEliminacion
      denunciaEliminada.eliminadoPor = 'admin' // En un sistema real, sería el usuario actual

      // Mover a papelera
      denunciasEliminadas.push(denunciaEliminada)

      // Remover de denuncias activas
      denuncias.splice(denunciaIndex, 1)

      // Guardar cambios
      this.set('denuncias', denuncias)
      this.set('denunciasEliminadas', denunciasEliminadas)
      this.actualizarEstadisticas()

      console.log(`Denuncia ${numeroCaso} movida a papelera`)
      return { success: true, message: 'Denuncia movida a papelera' }
    }
    return { success: false, message: 'Denuncia no encontrada' }
  }

  // Obtener denuncias eliminadas
  obtenerDenunciasEliminadas() {
    return this.get('denunciasEliminadas') || []
  }

  // Restaurar denuncia desde papelera
  restaurarDenuncia(numeroCaso) {
    const denuncias = this.get('denuncias') || []
    const denunciasEliminadas = this.get('denunciasEliminadas') || []

    const denunciaIndex = denunciasEliminadas.findIndex((d) => d.numeroCaso === numeroCaso)

    if (denunciaIndex !== -1) {
      const denunciaRestaurada = { ...denunciasEliminadas[denunciaIndex] }

      // Limpiar datos de eliminación
      delete denunciaRestaurada.fechaEliminacion
      delete denunciaRestaurada.razonEliminacion
      delete denunciaRestaurada.eliminadoPor

      // Actualizar fecha de modificación
      denunciaRestaurada.fechaActualizacion = new Date().toISOString()

      // Restaurar a denuncias activas
      denuncias.push(denunciaRestaurada)

      // Remover de papelera
      denunciasEliminadas.splice(denunciaIndex, 1)

      // Guardar cambios
      this.set('denuncias', denuncias)
      this.set('denunciasEliminadas', denunciasEliminadas)
      this.actualizarEstadisticas()

      console.log(`Denuncia ${numeroCaso} restaurada desde papelera`)
      return { success: true, message: 'Denuncia restaurada exitosamente' }
    }
    return { success: false, message: 'Denuncia no encontrada en papelera' }
  }

  // Eliminar permanentemente desde papelera
  eliminarPermanentemente(numeroCaso) {
    const denunciasEliminadas = this.get('denunciasEliminadas') || []
    const nuevasDenunciasEliminadas = denunciasEliminadas.filter((d) => d.numeroCaso !== numeroCaso)

    if (nuevasDenunciasEliminadas.length !== denunciasEliminadas.length) {
      this.set('denunciasEliminadas', nuevasDenunciasEliminadas)
      console.log(`Denuncia ${numeroCaso} eliminada permanentemente`)
      return { success: true, message: 'Denuncia eliminada permanentemente' }
    }
    return { success: false, message: 'Denuncia no encontrada en papelera' }
  }

  // Vaciar papelera (eliminar todas las denuncias eliminadas)
  vaciarPapelera() {
    const denunciasEliminadas = this.get('denunciasEliminadas') || []
    const cantidad = denunciasEliminadas.length

    this.set('denunciasEliminadas', [])
    console.log(`Papelera vaciada: ${cantidad} denuncias eliminadas permanentemente`)
    return { success: true, message: `${cantidad} denuncias eliminadas permanentemente` }
  }

  // Métodos para reportes de actividad sospechosa
  agregarReporteSospecha(reporteData) {
    const reportes = this.get('reportesSospecha') || []

    const reporte = {
      id: this.generateId(),
      nombre: reporteData.nombre || 'Anónimo',
      detalle: reporteData.detalle,
      ubicacion: reporteData.ubicacion || 'No especificada',
      fecha: new Date().toISOString(),
      estado: 'nuevo',
      revisado: false,
    }

    reportes.push(reporte)
    this.set('reportesSospecha', reportes)

    return reporte
  }

  // Métodos de filtrado y búsqueda
  filtrarDenuncias(filtros = {}) {
    const denuncias = this.get('denuncias') || []

    return denuncias.filter((denuncia) => {
      // Filtro por estado
      if (filtros.estado && filtros.estado !== 'todos' && denuncia.estado !== filtros.estado) {
        return false
      }

      // Filtro por fecha
      if (filtros.fechaInicio) {
        const fechaDenuncia = new Date(denuncia.fecha).toISOString().split('T')[0]
        if (fechaDenuncia < filtros.fechaInicio) return false
      }

      if (filtros.fechaFin) {
        const fechaDenuncia = new Date(denuncia.fecha).toISOString().split('T')[0]
        if (fechaDenuncia > filtros.fechaFin) return false
      }

      // Filtro por texto
      if (filtros.texto) {
        const texto = filtros.texto.toLowerCase()
        return (
          denuncia.detalle.toLowerCase().includes(texto) ||
          denuncia.numeroCaso.toLowerCase().includes(texto) ||
          denuncia.ubicacion.toLowerCase().includes(texto)
        )
      }

      return true
    })
  }

  // Estadísticas
  actualizarEstadisticas() {
    const denuncias = this.get('denuncias') || []
    const reportes = this.get('reportesSospecha') || []

    const estadisticas = {
      totalDenuncias: denuncias.length,
      denunciasPendientes: denuncias.filter((d) => d.estado === 'pendiente').length,
      denunciasEnProceso: denuncias.filter(
        (d) => d.estado === 'procesando' || d.estado === 'investigando'
      ).length,
      denunciasResueltas: denuncias.filter((d) => d.estado === 'resuelto').length,
      denunciasCerradas: denuncias.filter((d) => d.estado === 'cerrado').length,
      totalReportes: reportes.length,
      denunciasHoy: denuncias.filter(
        (d) => new Date(d.fecha).toDateString() === new Date().toDateString()
      ).length,
      ultimaActualizacion: new Date().toISOString(),
    }

    this.set('estadisticas', estadisticas)
    return estadisticas
  }

  obtenerEstadisticas() {
    return this.get('estadisticas') || this.actualizarEstadisticas()
  }

  // Métodos de utilidad
  generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9)
  }

  exportarDatos() {
    const datos = {
      denuncias: this.get('denuncias'),
      reportesSospecha: this.get('reportesSospecha'),
      configuracion: this.get('configuracion'),
      estadisticas: this.get('estadisticas'),
      fechaExportacion: new Date().toISOString(),
    }

    return JSON.stringify(datos, null, 2)
  }

  importarDatos(datosJSON) {
    try {
      const datos = JSON.parse(datosJSON)

      Object.keys(datos).forEach((key) => {
        if (key !== 'fechaExportacion') {
          this.set(key, datos[key])
        }
      })

      return true
    } catch (error) {
      console.error('Error al importar datos:', error)
      return false
    }
  }

  // === GESTIÓN DE NOTICIAS ===

  obtenerNoticias() {
    return this.get('noticias') || []
  }

  agregarNoticia(noticia) {
    try {
      const noticias = this.obtenerNoticias()

      // Validar datos requeridos
      if (!noticia.titulo || !noticia.contenido) {
        return {
          success: false,
          message: 'Título y contenido son requeridos',
        }
      }

      // Crear noticia completa
      const nuevaNoticia = {
        id: noticia.id || Date.now(),
        titulo: noticia.titulo,
        contenido: noticia.contenido,
        tipo: noticia.tipo || 'noticia',
        fecha: noticia.fecha || new Date().toISOString(),
        activa: noticia.activa !== undefined ? noticia.activa : true,
        autor: noticia.autor || 'Admin',
      }

      noticias.unshift(nuevaNoticia) // Agregar al inicio
      this.set('noticias', noticias)

      return {
        success: true,
        data: nuevaNoticia,
        message: 'Noticia agregada exitosamente',
      }
    } catch (error) {
      console.error('Error al agregar noticia:', error)
      return {
        success: false,
        message: 'Error interno al agregar la noticia',
      }
    }
  }

  actualizarNoticia(id, datosActualizados) {
    try {
      const noticias = this.obtenerNoticias()
      const indice = noticias.findIndex((n) => n.id == id)

      if (indice === -1) {
        return {
          success: false,
          message: 'Noticia no encontrada',
        }
      }

      noticias[indice] = {
        ...noticias[indice],
        ...datosActualizados,
        fechaActualizacion: new Date().toISOString(),
      }

      this.set('noticias', noticias)

      return {
        success: true,
        data: noticias[indice],
        message: 'Noticia actualizada exitosamente',
      }
    } catch (error) {
      console.error('Error al actualizar noticia:', error)
      return {
        success: false,
        message: 'Error interno al actualizar la noticia',
      }
    }
  }

  eliminarNoticia(id) {
    try {
      const noticias = this.obtenerNoticias()
      const indiceOriginal = noticias.length
      const noticiasActualizadas = noticias.filter((n) => n.id != id)

      if (noticiasActualizadas.length === indiceOriginal) {
        return {
          success: false,
          message: 'Noticia no encontrada',
        }
      }

      this.set('noticias', noticiasActualizadas)

      return {
        success: true,
        message: 'Noticia eliminada exitosamente',
      }
    } catch (error) {
      console.error('Error al eliminar noticia:', error)
      return {
        success: false,
        message: 'Error interno al eliminar la noticia',
      }
    }
  }

  filtrarNoticias(filtros = {}) {
    const noticias = this.obtenerNoticias()

    return noticias.filter((noticia) => {
      // Filtrar por tipo
      if (filtros.tipo && noticia.tipo !== filtros.tipo) {
        return false
      }

      // Filtrar por estado activo
      if (filtros.activa !== undefined && noticia.activa !== filtros.activa) {
        return false
      }

      // Filtrar por fecha
      if (filtros.fechaDesde) {
        const fechaNoticia = new Date(noticia.fecha)
        const fechaDesde = new Date(filtros.fechaDesde)
        if (fechaNoticia < fechaDesde) return false
      }

      if (filtros.fechaHasta) {
        const fechaNoticia = new Date(noticia.fecha)
        const fechaHasta = new Date(filtros.fechaHasta)
        if (fechaNoticia > fechaHasta) return false
      }

      return true
    })
  }

  // === GESTIÓN DE REPORTES DE ACTIVIDAD SOSPECHOSA ===

  guardarReporte(reporte) {
    try {
      const reportes = this.obtenerReportes()

      // Generar ID único si no existe
      if (!reporte.id) {
        const config = this.get('configuracion')
        reporte.id = 'REP-' + (config.contadorReportes || 1).toString().padStart(6, '0')
        config.contadorReportes = (config.contadorReportes || 1) + 1
        this.set('configuracion', config)
      }

      // Establecer valores por defecto
      reporte.fecha_reporte = reporte.fecha_reporte || new Date().toISOString()
      reporte.estado = reporte.estado || 'pendiente'

      reportes.push(reporte)
      this.set('reportes', reportes)

      // Actualizar estadísticas
      this.actualizarEstadisticasReportes()

      console.log('✅ Reporte guardado:', reporte.id)
      return reporte
    } catch (error) {
      console.error('❌ Error guardando reporte:', error)
      throw new Error('No se pudo guardar el reporte')
    }
  }

  obtenerReportes(filtros = {}) {
    try {
      const reportes = this.get('reportes') || []

      if (Object.keys(filtros).length === 0) {
        return reportes
      }

      return reportes.filter((reporte) => {
        // Filtrar por estado
        if (filtros.estado && reporte.estado !== filtros.estado) {
          return false
        }

        // Filtrar por tipo
        if (filtros.tipo && reporte.tipo !== filtros.tipo) {
          return false
        }

        // Filtrar por prioridad
        if (filtros.prioridad && reporte.prioridad !== filtros.prioridad) {
          return false
        }

        // Filtrar por fecha
        if (filtros.fechaDesde) {
          const fechaReporte = new Date(reporte.fecha_reporte)
          const fechaDesde = new Date(filtros.fechaDesde)
          if (fechaReporte < fechaDesde) return false
        }

        if (filtros.fechaHasta) {
          const fechaReporte = new Date(reporte.fecha_reporte)
          const fechaHasta = new Date(filtros.fechaHasta)
          if (fechaReporte > fechaHasta) return false
        }

        return true
      })
    } catch (error) {
      console.error('❌ Error obteniendo reportes:', error)
      return []
    }
  }

  obtenerReportePorId(id) {
    try {
      const reportes = this.obtenerReportes()
      return reportes.find((reporte) => reporte.id === id)
    } catch (error) {
      console.error('❌ Error obteniendo reporte por ID:', error)
      return null
    }
  }

  actualizarReporte(id, datosActualizados) {
    try {
      const reportes = this.obtenerReportes()
      const index = reportes.findIndex((reporte) => reporte.id === id)

      if (index === -1) {
        throw new Error('Reporte no encontrado')
      }

      // Mantener fecha de creación y actualizar fecha de modificación
      reportes[index] = {
        ...reportes[index],
        ...datosActualizados,
        fecha_actualizacion: new Date().toISOString(),
      }

      this.set('reportes', reportes)
      this.actualizarEstadisticasReportes()

      console.log('✅ Reporte actualizado:', id)
      return reportes[index]
    } catch (error) {
      console.error('❌ Error actualizando reporte:', error)
      throw error
    }
  }

  eliminarReporte(id) {
    try {
      const reportes = this.obtenerReportes()
      const reportesFiltrados = reportes.filter((reporte) => reporte.id !== id)

      if (reportes.length === reportesFiltrados.length) {
        throw new Error('Reporte no encontrado')
      }

      this.set('reportes', reportesFiltrados)
      this.actualizarEstadisticasReportes()

      console.log('✅ Reporte eliminado:', id)
      return true
    } catch (error) {
      console.error('❌ Error eliminando reporte:', error)
      throw error
    }
  }

  actualizarEstadisticasReportes() {
    try {
      const reportes = this.obtenerReportes()
      const estadisticas = this.get('estadisticas')

      estadisticas.totalReportes = reportes.length
      estadisticas.reportesPendientes = reportes.filter((r) => r.estado === 'pendiente').length
      estadisticas.ultimoReporte =
        reportes.length > 0 ? reportes[reportes.length - 1].fecha_reporte : null

      this.set('estadisticas', estadisticas)
    } catch (error) {
      console.error('❌ Error actualizando estadísticas de reportes:', error)
    }
  }

  // === UTILIDADES GENERALES ===

  limpiarDatos() {
    const keys = ['denuncias', 'reportesSospecha', 'reportes', 'estadisticas', 'noticias']
    keys.forEach((key) => {
      localStorage.removeItem(this.storagePrefix + key)
    })
    this.initializeStorage()
  }
}

// Crear instancia global
window.dataManager = new DataManager()
