// Script para agregar datos de prueba de reportes
function agregarDatosPruebaReportes() {
  console.log('🔧 Agregando datos de prueba para reportes...')

  const dataManager = new DataManager()

  const reportesPrueba = [
    {
      id: 'REP-000001',
      tipo: 'documentos-falsos',
      descripcion:
        'Se observó a una persona vendiendo documentos de identidad falsos cerca del parque central. Tiene una mesa con varios pasaportes y cédulas.',
      ubicacion: 'Parque Central, Santo Domingo Este',
      fecha_incidente: '2025-08-10T14:30:00.000Z',
      personas_involucradas: 'Hombre de aproximadamente 40 años, altura media, con gorra azul',
      evidencia: 'Fotos tomadas desde lejos, testigos en el área',
      prioridad: 'alta',
      nombre_reportante: 'Juan Pérez',
      telefono_reportante: '809-555-0123',
      email_reportante: 'juan.perez@email.com',
      fecha_reporte: '2025-08-10T15:00:00.000Z',
      estado: 'pendiente',
      ip_reportante: '192.168.1.100',
      navegador: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    {
      id: 'REP-000002',
      tipo: 'trabajo-irregular',
      descripcion:
        'Empresa constructora empleando trabajadores extranjeros sin permisos de trabajo. Condiciones laborales muy precarias.',
      ubicacion: 'Zona Industrial Las Américas, Santo Domingo',
      fecha_incidente: '2025-08-09T08:00:00.000Z',
      personas_involucradas: 'Aproximadamente 15-20 trabajadores, supervisor con camioneta blanca',
      evidencia: 'Videos de los trabajadores llegando temprano en la mañana',
      prioridad: 'media',
      fecha_reporte: '2025-08-09T18:30:00.000Z',
      estado: 'en_revision',
      ip_reportante: '192.168.1.101',
      navegador: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
    },
    {
      id: 'REP-000003',
      tipo: 'trafico-personas',
      descripcion:
        'URGENTE: Se escucharon gritos de auxilio desde una casa abandonada. Varias personas encerradas.',
      ubicacion: 'Coordenadas: 18.4861, -69.9312',
      fecha_incidente: '2025-08-11T22:00:00.000Z',
      personas_involucradas: 'Se escucharon voces de mujeres pidiendo ayuda, al menos 3-4 personas',
      evidencia: 'Grabación de audio de los gritos',
      prioridad: 'urgente',
      nombre_reportante: 'María González',
      telefono_reportante: '809-555-0456',
      fecha_reporte: '2025-08-11T22:15:00.000Z',
      estado: 'en_investigacion',
      ip_reportante: '192.168.1.102',
      navegador: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    {
      id: 'REP-000004',
      tipo: 'establecimiento-irregular',
      descripcion:
        'Restaurant que no verifica estatus migratorio de empleados. Varios trabajadores sin documentación apropiada.',
      ubicacion: 'Av. Winston Churchill, Plaza comercial',
      fecha_incidente: '2025-08-08T19:00:00.000Z',
      personas_involucradas: 'Personal de cocina y meseros, gerente del local',
      prioridad: 'baja',
      fecha_reporte: '2025-08-08T20:00:00.000Z',
      estado: 'resuelto',
      ip_reportante: '192.168.1.103',
      navegador: 'Mozilla/5.0 (Android 11; Mobile)',
    },
  ]

  // Guardar cada reporte
  reportesPrueba.forEach((reporte) => {
    try {
      dataManager.guardarReporte(reporte)
      console.log(`✅ Reporte ${reporte.id} guardado`)
    } catch (error) {
      console.error(`❌ Error guardando reporte ${reporte.id}:`, error)
    }
  })

  console.log('✅ Datos de prueba agregados exitosamente')
  console.log(`📊 Total de reportes: ${dataManager.obtenerReportes().length}`)
}

// Ejecutar automáticamente
agregarDatosPruebaReportes()
