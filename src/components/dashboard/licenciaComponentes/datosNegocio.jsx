function DatosNegocio() {
  return (
    <section className="px-8 py-12">
      <div class="relative overflow-x-auto">
        <table class="w-full text-sm text-left text-gray-500 ">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50 ">
            <tr>
              <th scope="col" class="px-6 py-3">
                Product name
              </th>
              <th scope="col" class="px-6 py-3">
                Color
              </th>
            </tr>
          </thead>
          <tbody>
            <tr class="bg-white border-b ">
              <th scope="row" class="px-6 py-4 font-extrabold text-gray-900  ">
                Nombre
              </th>
              <td class="px-6 py-4">Ulises</td>
            </tr>
            <tr class="bg-white border-b ">
              <th scope="row" class="px-6 py-4 font-extrabold text-gray-900  ">
                Apellido
              </th>
              <td class="px-6 py-4">Jacobo Robles</td>
            </tr>
            <tr class="bg-white border-b ">
              <th scope="row" class="px-6 py-4 font-extrabold text-gray-900  ">
                Correo
              </th>
              <td class="px-6 py-4">Ulises.Jabobo@hotmail.com</td>
            </tr>
            <tr class="bg-white border-b ">
              <th scope="row" class="px-6 py-4 font-extrabold text-gray-900  ">
                Teléfono contacto
              </th>
              <td class="px-6 py-4">55 2548 7845</td>
            </tr>
            <tr class="bg-white border-b ">
              <th scope="row" class="px-6 py-4 font-extrabold text-gray-900  ">
                Fecha expiración
              </th>
              <td class="px-6 py-4">16/01/224</td>
            </tr>
            <tr class="bg-white border-b ">
              <th scope="row" class="px-6 py-4 font-extrabold text-gray-900  ">
                Tipo de membresía
              </th>
              <td class="px-6 py-4">Estándar/Empresarial</td>
            </tr>
            <tr class="bg-white border-b ">
              <th scope="row" class="px-6 py-4 font-extrabold text-gray-900  ">
                Numero de licencias
              </th>
              <td class="px-6 py-4">2</td>
            </tr>
            <tr class="bg-white border-b ">
              <th scope="row" class="px-6 py-4 font-extrabold text-gray-900  ">
                Nombre de la empresa
              </th>
              <td class="px-6 py-4">Empresa Patito</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default DatosNegocio;
