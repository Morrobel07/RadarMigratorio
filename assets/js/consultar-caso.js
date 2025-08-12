document.getElementById('form-consulta').addEventListener('submit', function (e) {
  e.preventDefault()

  const numeroCaso = document.getElementById('numero-caso').value.trim()
  const denuncias = JSON.parse(localStorage.getItem('denuncias')) || []

  const casoEncontrado = denuncias.find((d) => d.numeroCaso === numeroCaso)

  const resultadoDiv = document.getElementById('resultado-consulta')

  if (casoEncontrado) {
    const estadoColor = {
      pendiente: '#ffa500',
      investigando: '#2196f3',
      derivado: '#9c27b0',
      resuelto: '#4caf50',
      cerrado: '#607d8b',
    }

    resultadoDiv.innerHTML = `
      <div class="caso-encontrado">
        <h3>Caso Encontrado</h3>
        <div class="detalle-caso">
          <p><strong>Número:</strong> ${casoEncontrado.numeroCaso}</p>
          <p><strong>Estado:</strong> <span style="color: ${
            estadoColor[casoEncontrado.estado] || '#000'
          }">${casoEncontrado.estado.toUpperCase()}</span></p>
          <p><strong>Fecha de Denuncia:</strong> ${new Date(
            casoEncontrado.fecha
          ).toLocaleDateString()}</p>
          <p><strong>Última Actualización:</strong> ${new Date(
            casoEncontrado.fechaActualizacion
          ).toLocaleDateString()}</p>
          <p><strong>Prioridad:</strong> ${casoEncontrado.prioridad}</p>
          ${
            casoEncontrado.observaciones
              ? `<p><strong>Observaciones:</strong> ${casoEncontrado.observaciones}</p>`
              : ''
          }
        </div>
      </div>
    `
  } else {
    resultadoDiv.innerHTML = `
      <div class="caso-no-encontrado">
        <h3>Caso No Encontrado</h3>
        <p>No se encontró ningún caso con el número proporcionado. Verifique que el número sea correcto.</p>
      </div>
    `
  }
})
