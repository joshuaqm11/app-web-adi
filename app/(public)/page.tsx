export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">

      {/* HERO */}
      <section className="bg-green-800 text-white py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">
          Cementerio San Juan de Florencia
        </h1>
        <p className="text-lg">
          Sistema de gestión y consulta del cementerio
        </p>
      </section>

      {/* CONTENIDO */}
      <section className="max-w-6xl mx-auto py-12 px-6 grid md:grid-cols-3 gap-8">

        {/* Cementerio */}
        <a
          href="/cementerio"
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
        >
          <h2 className="text-2xl font-semibold mb-3 text-green-700">
            Cementerio
          </h2>

          <p className="text-gray-600">
            Visualice el mapa de bóvedas del cementerio y consulte
            información sobre cada espacio disponible o ocupado.
          </p>
        </a>

        {/* Reglamento */}
        <a
          href="/reglamento"
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
        >
          <h2 className="text-2xl font-semibold mb-3 text-green-700">
            Reglamento
          </h2>

          <p className="text-gray-600">
            Consulte el reglamento oficial para el uso, mantenimiento
            y administración del cementerio.
          </p>
        </a>

        {/* Contacto */}
        <a
          href="/contacto"
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
        >
          <h2 className="text-2xl font-semibold mb-3 text-green-700">
            Contacto
          </h2>

          <p className="text-gray-600">
            Información de contacto para consultas administrativas
            o relacionadas con los registros del cementerio.
          </p>
        </a>

      </section>

      {/* FOOTER */}
      <footer className="bg-gray-800 text-white text-center py-6">
        <p>© 2026 Cementerio San Juan de Florencia</p>
      </footer>

    </main>
  );
}