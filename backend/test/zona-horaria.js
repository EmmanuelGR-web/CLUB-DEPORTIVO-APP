// Los tests corren con la misma zona horaria que el servidor (main.ts),
// así las fechas de vencimiento dan igual en cualquier máquina.
module.exports = async () => {
  process.env.TZ = 'America/Argentina/Buenos_Aires';
};
