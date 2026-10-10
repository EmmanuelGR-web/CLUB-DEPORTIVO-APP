import Swal from 'sweetalert2'

const clases = {
  popup: 'rounded-4 shadow',
  title: 'fs-4 fw-bold text-secondary',
  htmlContainer: 'text-body-secondary',
  actions: 'gap-2',
  confirmButton: 'btn btn-secondary rounded-pill px-4',
  cancelButton: 'btn btn-outline-secondary rounded-pill px-4',
}

const alertaClub = Swal.mixin({
  buttonsStyling: false,
  customClass: clases,
  confirmButtonText: 'Entendido',
  cancelButtonText: 'Cancelar',
  reverseButtons: true,
})

export const alertaError = (texto, titulo = 'Algo salió mal') => alertaClub.fire({ icon: 'error', iconColor: '#d7263d', title: titulo, text: texto })

export const alertaExito = (texto, titulo = '¡Listo!') =>
  alertaClub.fire({ icon: 'success', title: titulo, text: texto, timer: 2500, timerProgressBar: true, showConfirmButton: false })

export const alertaAviso = (texto, titulo = 'Atención') => alertaClub.fire({ icon: 'warning', iconColor: '#e3b23c', title: titulo, text: texto })

export const alertaMensaje = ({ icono = 'success', titulo, texto, boton = 'Entendido' }) =>
  alertaClub.fire({ icon: icono, title: titulo, text: texto, confirmButtonText: boton })

export const alertaBienvenida = (texto) =>
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: texto,
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    customClass: { popup: 'rounded-4 shadow', title: 'fs-6 fw-semibold text-secondary' },
  })

export const confirmarBorrado = async ({ titulo, texto, boton = 'Sí, borrar', accion }) => {
  const respuesta = await alertaClub.fire({
    icon: 'warning',
    iconColor: '#e3b23c',
    title: titulo,
    text: texto,
    showCancelButton: true,
    confirmButtonText: boton,
    customClass: { ...clases, confirmButton: 'btn btn-danger rounded-pill px-4' },
    showLoaderOnConfirm: true,
    allowOutsideClick: () => !Swal.isLoading(),
    preConfirm: async () => {
      try {
        await accion()
        return true
      } catch (problema) {
        Swal.showValidationMessage(problema.message)
        return false
      }
    },
  })
  return respuesta.isConfirmed
}

export const confirmarSalida = async () => {
  const respuesta = await alertaClub.fire({
    icon: 'question',
    iconColor: '#7a0f2e',
    title: '¿Cerrar sesión?',
    text: 'Vas a tener que volver a ingresar con tu correo y contraseña.',
    showCancelButton: true,
    confirmButtonText: 'Cerrar sesión',
  })
  return respuesta.isConfirmed
}
