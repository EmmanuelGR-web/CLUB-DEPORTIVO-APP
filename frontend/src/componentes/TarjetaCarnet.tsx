// 'use client';

// import { useEffect, useRef } from 'react';
// import JsBarcode from 'jsbarcode';
// import Image from 'next/image';
// import { Carnet } from '@/tipos';

// const COLOR_POR_CATEGORIA: Record<string, string> = {
//   Oro: 'from-dorado to-yellow-600',
//   Plata: 'from-plata to-gray-400',
//   Bronce: 'from-bronce to-orange-800',
// };

// export function TarjetaCarnet({ carnet }: { carnet: Carnet }) {
//   const refSvgCodigoBarras = useRef<SVGSVGElement>(null);

//   // JsBarcode dibuja directamente sobre un <svg>, por eso no se puede
//   // hacer 100% declarativo como el resto de React: se ejecuta en un
//   // efecto cada vez que cambia el código a representar.
//   useEffect(() => {
//     if (refSvgCodigoBarras.current) {
//       JsBarcode(refSvgCodigoBarras.current, carnet.codigoBarras, {
//         format: 'CODE128',
//         width: 2,
//         height: 50,
//         displayValue: false,
//         background: 'transparent',
//         lineColor: '#1C1B1A',
//       });
//     }
//   }, [carnet.codigoBarras]);

//   const degradeCategoria = COLOR_POR_CATEGORIA[carnet.categoria] ?? 'from-rojo-club to-rojo-profundo';

//   return (
//     <div className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-carbon/10 bg-white shadow-lg dark:border-white/10 dark:bg-carbon-suave">
//       {/* Encabezado con el degradé de la categoría del socio y las rayas del escudo */}
//       <div className={` relative bg-gradient-to-br ${degradeCategoria} px-6 py-5 text-black`}>
//         <p className="font-titulo text-xs font-semibold uppercase tracking-widest opacity-90">
//           Club Atlético San Martín de Tucumán
//         </p>
//         <img src="/logo.png" alt="logo" className="h-24 w-24 object-contain display:flex" />
//         <p className="mt-0.5 font-titulo text-lg font-bold uppercase tracking-wide">
//           Socio {carnet.categoria}
//         </p>
//       </div>

//       <div className="flex gap-4 p-6">
//         <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-carbon/10 dark:bg-white/10">
//           {carnet.fotoCarnetUrl ? (
//             <Image
//               src={carnet.fotoCarnetUrl}
//               alt={`Foto de carnet de ${carnet.nombreCompleto}`}
//               width={96}
//               height={96}
//               className="h-full w-full object-cover"
//             />
//           ) : (
//             <div className="flex h-full w-full items-center justify-center font-titulo text-3xl text-carbon/30 dark:text-hueso/30">
//               {carnet.nombreCompleto.charAt(0)}
//             </div>
//           )}
//         </div>

//         <div className="flex flex-col justify-center gap-1">
//           <p className="font-titulo text-xl font-bold leading-tight">{carnet.nombreCompleto}</p>
//           <p className="font-dato text-sm text-carbon/60 dark:text-hueso/60">
//             Socio N.º {carnet.idSocio}
//           </p>
//           <p className="font-cuerpo text-sm text-carbon/60 dark:text-hueso/60">
//             {carnet.antiguedadAnios} {carnet.antiguedadAnios === 1 ? 'año' : 'años'} de antigüedad
//           </p>
//           <span
//             className={`mt-1 w-fit rounded-full px-2.5 py-0.5 font-cuerpo text-xs font-medium ${
//               carnet.socioActivo
//                 ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
//                 : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
//             }`}
//           >
//             {carnet.socioActivo ? 'Activo' : 'Inactivo'}
//           </span>
//         </div>
//       </div>

//       <div className="border-t border-carbon/10 bg-hueso px-6 py-4 dark:border-white/10 dark:bg-carbon">
//         <svg ref={refSvgCodigoBarras} className="w-full" />
//         <p className="mt-1 text-center font-dato text-xs tracking-widest text-carbon/50 dark:text-hueso/50">
//           {carnet.codigoBarras}
//         </p>
//       </div>
//     </div>
//   );
// }
'use client';

import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import Image from 'next/image';
import { Carnet } from '@/tipos';

const COLOR_POR_CATEGORIA: Record<string, string> = {
  Oro: 'from-dorado to-yellow-600',
  Plata: 'from-plata to-gray-400',
  Bronce: 'from-bronce to-orange-800',
};

export function TarjetaCarnet({ carnet }: { carnet: Carnet }) {
  const refSvgCodigoBarras = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (refSvgCodigoBarras.current) {
      JsBarcode(refSvgCodigoBarras.current, carnet.codigoBarras, {
        format: 'CODE128',
        width: 2,
        height: 50,
        displayValue: false,
        background: 'transparent',
        lineColor: '#1C1B1A',
      });
    }
  }, [carnet.codigoBarras]);

  const degradeCategoria = COLOR_POR_CATEGORIA[carnet.categoria] ?? 'from-rojo-club to-rojo-profundo';

  return (
    <div className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-carbon/10 bg-white shadow-lg dark:border-white/10 dark:bg-carbon-suave">
      
      {/* Header con fondo degradado, imagen de fondo difuminada y escudo */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${degradeCategoria} px-6 py-5`}>
        
        {/* IMAGEN DE FONDO DIFUMINADA Y TRANSPARENTE */}
        {/* Reemplaza '/ruta-a-tu-imagen.jpg' con la ruta de tu imagen */}
        <div 
          className="absolute inset-0 z-0 opacity-80 blur-md" 
          style={{ 
            backgroundImage: "url('/fondo.jpeg')",
            backgroundSize: 'cover', 
            backgroundPosition: 'center' 
          }}
        />

        {/* Contenido del Header (Z-1 para estar sobre la imagen pero debajo del escudo si es necesario) */}
        <div className="relative z-10 flex flex-col">
          <p className="font-titulo text-xs font-semibold uppercase tracking-widest opacity-90">
            CLUB DEPORTIVO
          </p>
          
          <p className="mt-1 font-titulo text-lg font-bold uppercase tracking-wide">
            Socio {carnet.categoria}
          </p>
        </div>

        {/* ESCUDO EN LA ESQUINA SUPERIOR DERECHA */}
        <img 
          src="/logo.png" 
          alt="Escudo del club" 
          className="absolute top-4 right-4 h-16 w-16 object-contain z-20 drop-shadow-md" 
        />
      </div>

      <div className="flex gap-4 p-6">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-carbon/10 dark:bg-white/10">
          {carnet.fotoCarnetUrl ? (
            <Image
              src={carnet.fotoCarnetUrl}
              alt={`Foto de carnet de ${carnet.nombreCompleto}`}
              width={96}
              height={96}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-titulo text-3xl text-carbon/30 dark:text-hueso/30">
              {carnet.nombreCompleto.charAt(0)}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center gap-1">
          <p className="font-titulo text-xl font-bold leading-tight">{carnet.nombreCompleto}</p>
          <p className="font-dato text-sm text-carbon/60 dark:text-hueso/60">
            Socio N.º {carnet.idSocio}
          </p>
          <p className="font-cuerpo text-sm text-carbon/60 dark:text-hueso/60">
            {carnet.antiguedadAnios} {carnet.antiguedadAnios === 1 ? 'año' : 'años'} de antigüedad
          </p>
          <span
            className={`mt-1 w-fit rounded-full px-2.5 py-0.5 font-cuerpo text-xs font-medium ${
              carnet.socioActivo
                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
            }`}
          >
            {carnet.socioActivo ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>

      <div className="border-t border-carbon/10 bg-hueso px-6 py-4 dark:border-white/10 dark:bg-carbon">
        <svg ref={refSvgCodigoBarras} className="w-full" />
        <p className="mt-1 text-center font-dato text-xs tracking-widest text-carbon/50 dark:text-hueso/50">
          {carnet.codigoBarras}
        </p>
      </div>
    </div>
  );
}
