// =====================================================================
// alertas.ts
// -----------------------------------------------------------------------
// Todos los avisos del portal pasan por acá. SweetAlert2 se configura
// una sola vez con botones de Bootstrap y los colores del club, así
// cada pantalla solo dice QUÉ avisar y no CÓMO se ve el aviso.
// =====================================================================

import Swal from 'sweetalert2';

const clases = {
  popup: 'rounded-4 shadow',
  title: 'fs-4 fw-bold titulo-panel',
  htmlContainer: 'text-body-secondary',
  actions: 'gap-2',
  confirmButton: 'btn btn-secondary rounded-pill px-4',
  cancelButton: 'btn btn-outline-secondary rounded-pill px-4',
};

const alertaClub = Swal.mixin({
  buttonsStyling: false,
  customClass: clases,
  confirmButtonText: 'Entendido',
  cancelButtonText: 'Cancelar',
  reverseButtons: true,
});

export const alertaError = (texto: string, titulo = 'No pudimos completar la acción') =>
  alertaClub.fire({ icon: 'error', iconColor: '#d7263d', title: titulo, text: texto });

export const alertaExito = (texto: string, titulo = 'Listo') =>
  alertaClub.fire({
    icon: 'success',
    title: titulo,
    text: texto,
    timer: 2600,
    timerProgressBar: true,
    showConfirmButton: false,
  });

export const alertaAviso = (texto: string, titulo = 'Atención') =>
  alertaClub.fire({ icon: 'warning', iconColor: '#e3b23c', title: titulo, text: texto });

export const avisoBreve = (texto: string, icono: 'success' | 'info' = 'success') =>
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: icono,
    title: texto,
    showConfirmButton: false,
    timer: 2600,
    timerProgressBar: true,
    customClass: { popup: 'rounded-4 shadow', title: 'fs-6 fw-semibold' },
  });

// Pide confirmación y ejecuta la acción dentro del mismo diálogo: si
// falla, el error se muestra ahí mismo sin cerrar la ventana.
export async function confirmarAccion({
  titulo,
  texto,
  html,
  boton = 'Confirmar',
  accion,
}: {
  titulo: string;
  texto?: string;
  html?: string;
  boton?: string;
  accion: () => Promise<unknown>;
}) {
  const respuesta = await alertaClub.fire({
    icon: 'question',
    iconColor: '#7a0f2e',
    title: titulo,
    text: texto,
    html,
    showCancelButton: true,
    confirmButtonText: boton,
    showLoaderOnConfirm: true,
    allowOutsideClick: () => !Swal.isLoading(),
    preConfirm: async () => {
      try {
        await accion();
        return true;
      } catch (problema) {
        Swal.showValidationMessage(problema instanceof Error ? problema.message : 'Ocurrió un error');
        return false;
      }
    },
  });
  return respuesta.isConfirmed;
}

export async function confirmarSalida() {
  const respuesta = await alertaClub.fire({
    icon: 'question',
    iconColor: '#7a0f2e',
    title: '¿Cerrar sesión?',
    text: 'Vas a tener que ingresar de nuevo para ver tu carnet.',
    showCancelButton: true,
    confirmButtonText: 'Cerrar sesión',
  });
  return respuesta.isConfirmed;
}
