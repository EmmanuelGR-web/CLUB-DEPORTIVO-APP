// =====================================================================
// ia.service.ts
// -----------------------------------------------------------------------
// Lee fotos del DNI y comprobantes de pago con Gemini (plan gratuito de
// Google AI Studio). La clave GEMINI_API_KEY vive solo en el servidor.
// Si no está configurada, el portal sigue funcionando y los datos se
// completan a mano.
// =====================================================================

import { BadRequestException, HttpException, HttpStatus, Injectable, PayloadTooLargeException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const MODELOS_GRATIS = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.5-flash-lite'];
const REINTENTABLES = [404, 429, 500, 503];
const TAMANIO_MAXIMO = 4 * 1024 * 1024;
const TIPOS_PERMITIDOS = /^data:(image\/(jpeg|png|webp|gif)|application\/pdf);base64,/;

const ESQUEMAS = {
  dni: {
    type: 'OBJECT',
    properties: {
      esDni: { type: 'BOOLEAN', description: 'true si las imágenes son de un DNI argentino' },
      legible: { type: 'BOOLEAN', description: 'true si los datos principales se pueden leer con seguridad' },
      apellido: { type: 'STRING' },
      nombres: { type: 'STRING' },
      numeroDni: { type: 'STRING', description: 'Solo los dígitos, sin puntos' },
      fechaNacimiento: { type: 'STRING', description: 'Formato AAAA-MM-DD' },
      fechaVencimiento: { type: 'STRING', description: 'Formato AAAA-MM-DD, vacío si no figura' },
      domicilio: { type: 'STRING', description: 'Calle y número, localidad y provincia, tal como figura en el dorso' },
      observaciones: { type: 'STRING', description: 'Problemas encontrados (foto borrosa, reflejo, falta un lado), en español y breve' },
    },
    required: ['esDni', 'legible'],
  },
  comprobante: {
    type: 'OBJECT',
    properties: {
      esComprobante: { type: 'BOOLEAN', description: 'true si es un comprobante de pago, transferencia o depósito' },
      legible: { type: 'BOOLEAN' },
      monto: { type: 'NUMBER', description: 'Importe pagado en pesos, sin separadores de miles' },
      fecha: { type: 'STRING', description: 'Fecha del pago, formato AAAA-MM-DD' },
      medio: { type: 'STRING', enum: ['Transferencia', 'Billetera virtual', 'Depósito', 'Efectivo', 'Otro'] },
      numeroOperacion: { type: 'STRING', description: 'Número de operación, transacción o comprobante' },
      origen: { type: 'STRING', description: 'Quién pagó y desde qué banco o billetera' },
      destino: { type: 'STRING', description: 'A quién se pagó' },
      observaciones: { type: 'STRING', description: 'Algo raro o que no se pudo leer, en español y breve' },
    },
    required: ['esComprobante', 'legible'],
  },
};

const INSTRUCCIONES = {
  dni: 'Leé este DNI argentino. La primera imagen es el frente y la segunda el dorso. Copiá los datos exactamente como figuran. Si un dato no se lee con seguridad, dejalo vacío en lugar de adivinar.',
  comprobante: (hoy: string) =>
    `Leé este comprobante de pago de una cuota social. Hoy es ${hoy}: si la fecha no trae año, usá el de hoy. Si un dato no se lee con seguridad, dejalo vacío en lugar de adivinar.`,
};

const fechaValida = (texto?: string) => (/^\d{4}-\d{2}-\d{2}$/.test(texto ?? '') ? texto! : '');

const capitalizar = (texto = '') =>
  texto
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((palabra) => (['de', 'del', 'la', 'y'].includes(palabra) ? palabra : palabra[0].toUpperCase() + palabra.slice(1)))
    .join(' ');

/* eslint-disable @typescript-eslint/no-explicit-any */
const ordenarDni = (d: any) => ({
  esDni: Boolean(d.esDni),
  legible: Boolean(d.legible),
  nombre: capitalizar(d.nombres ?? ''),
  apellido: capitalizar(d.apellido ?? ''),
  dni: String(d.numeroDni ?? '').replace(/\D/g, ''),
  fechaNacimiento: fechaValida(d.fechaNacimiento),
  vencimiento: fechaValida(d.fechaVencimiento),
  direccion: d.domicilio ?? '',
  observaciones: d.observaciones ?? '',
});

const ordenarComprobante = (d: any) => ({
  esComprobante: Boolean(d.esComprobante),
  legible: Boolean(d.legible),
  monto: typeof d.monto === 'number' && d.monto > 0 ? Math.round(d.monto * 100) / 100 : null,
  fecha: fechaValida(d.fecha),
  medio: d.medio ?? '',
  numeroOperacion: String(d.numeroOperacion ?? '').trim(),
  origen: d.origen ?? '',
  destino: d.destino ?? '',
  observaciones: d.observaciones ?? '',
});

const parteDe = (dataUrl: string) => {
  const [cabecera, datos] = dataUrl.split(',');
  return { inline_data: { mime_type: cabecera.slice(5, cabecera.indexOf(';')), data: datos } };
};

@Injectable()
export class IaService {
  constructor(private readonly config: ConfigService) {}

  async leer(tipo: 'dni' | 'comprobante', archivos: { dataUrl: string }[], hoy?: string) {
    const clave = this.config.get<string>('GEMINI_API_KEY');
    if (!clave) throw new ServiceUnavailableException('La lectura con IA no está configurada en este servidor.');

    const cantidad = tipo === 'dni' ? 2 : 1;
    if (!Array.isArray(archivos) || archivos.length !== cantidad) throw new BadRequestException('Faltan las imágenes del documento.');
    if (archivos.some((a) => typeof a?.dataUrl !== 'string' || !TIPOS_PERMITIDOS.test(a.dataUrl))) {
      throw new BadRequestException('Solo se aceptan imágenes o PDF.');
    }
    if (archivos.reduce((total, a) => total + a.dataUrl.length, 0) > TAMANIO_MAXIMO) {
      throw new PayloadTooLargeException('Los archivos son demasiado pesados.');
    }

    const texto = tipo === 'dni' ? INSTRUCCIONES.dni : INSTRUCCIONES.comprobante(hoy ?? new Date().toISOString().slice(0, 10));
    const modeloElegido = this.config.get<string>('GEMINI_MODEL');
    const modelos = modeloElegido ? [modeloElegido, ...MODELOS_GRATIS] : MODELOS_GRATIS;

    let respuesta: Response | undefined;
    try {
      for (const modelo of modelos) {
        respuesta = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`, {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-goog-api-key': clave },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [...archivos.map((a) => parteDe(a.dataUrl)), { text: texto }] }],
            generationConfig: { temperature: 0, responseMimeType: 'application/json', responseSchema: ESQUEMAS[tipo] },
          }),
          signal: AbortSignal.timeout(40000),
        });
        if (!REINTENTABLES.includes(respuesta.status)) break;
      }
    } catch {
      throw new HttpException('No pudimos conectar con el servicio de IA.', HttpStatus.BAD_GATEWAY);
    }

    if (!respuesta) throw new HttpException('No pudimos conectar con el servicio de IA.', HttpStatus.BAD_GATEWAY);
    if (respuesta.status === 429) {
      throw new HttpException('Se alcanzó el límite gratuito de lecturas por minuto. Probá de nuevo en un rato.', HttpStatus.TOO_MANY_REQUESTS);
    }
    if (respuesta.status === 503) throw new ServiceUnavailableException('El servicio de IA está saturado en este momento. Probá de nuevo en unos minutos.');
    if (!respuesta.ok) throw new HttpException('El servicio de IA no pudo leer el documento. Probá de nuevo.', HttpStatus.BAD_GATEWAY);

    const datos: any = await respuesta.json();
    let lectura: any;
    try {
      lectura = JSON.parse(datos.candidates?.[0]?.content?.parts?.find((parte: any) => parte.text)?.text ?? '');
    } catch {
      throw new HttpException('La IA no devolvió datos.', HttpStatus.BAD_GATEWAY);
    }
    return tipo === 'dni' ? ordenarDni(lectura) : ordenarComprobante(lectura);
  }
}
