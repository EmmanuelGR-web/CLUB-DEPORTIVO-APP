-- =========================================================================
-- Migración 005: beneficios para socios.
--
-- Hasta ahora eran fijos en el frontend. Pasan a la base para que el
-- personal y la administración los publiquen, editen o borren, igual
-- que las noticias. Se cargan los seis que ya mostraba el portal.
-- =========================================================================

CREATE TABLE beneficios (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo          VARCHAR(60) NOT NULL,
    detalle         VARCHAR(80) NOT NULL,   -- lo que se ve en la tarjeta: "15 % de descuento"
    descripcion     TEXT NOT NULL,
    extra           VARCHAR(120) NOT NULL DEFAULT '', -- condición breve: "De 7 a 23 h"
    orden           INT NOT NULL DEFAULT 0,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO beneficios (titulo, detalle, extra, descripcion, orden) VALUES
    ('Acceso al gimnasio', 'Libre todos los días', 'De 7 a 23 h, con profe incluido', 'Usá la sala de musculación y el área funcional del club todos los días. Hay profes que arman tu rutina y clases grupales de funcional y spinning incluidas en la cuota.', 1),
    ('Tienda oficial', '15 % de descuento', 'En camisetas, buzos y accesorios', 'Mostrá tu carnet digital en la tienda oficial de la sede o usá tu número de socio en la tienda online. El descuento se suma a las promociones del mes.', 2),
    ('Match Day', 'Prioridad en entradas', 'Anticipadas 48 h antes que el público', 'Las entradas para socios salen a la venta 48 horas antes que para el público general. Además tenés un sector preferencial en La Caldera y acceso por una puerta exclusiva.', 3),
    ('Eventos especiales', 'Cenas y encuentros', 'Con jugadores e ídolos del club', 'Cenas de aniversario, presentaciones de camiseta y encuentros con jugadores e ídolos del club. Las invitaciones llegan a tu bandeja de entrada.', 4),
    ('Comercios aliados', 'Descuentos en la ciudad', 'Más de 40 comercios en Tucumán', 'Descuentos en gastronomía, farmacias, ópticas y ropa deportiva en más de 40 comercios de San Miguel de Tucumán y Yerba Buena. Solo mostrá tu carnet.', 5),
    ('Contenido online', 'Partidos y entrevistas', 'Resúmenes y transmisiones exclusivas', 'Mirá los resúmenes de cada partido, entrevistas exclusivas y transmisiones en vivo de las categorías formativas desde la web del club.', 6);
