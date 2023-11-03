function DatosFiscales() {
  return (
    <section className="px-8 py-12">
      <form>
        <div class="mb-6">
          <label
            for="text"
            class="block mb-2 text-sm font-medium text-gray-900 "
          >
            RFC
          </label>
          <input
            type="text"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
            placeholder="ABC 680524 P-76"
            maxlength="4"
            required
          />
        </div>
        <div class="mb-6">
          <label
            for="text"
            class="block mb-2 text-sm font-medium text-gray-900 "
          >
            Nombre/Razón social
          </label>
          <input
            type="text"
            id="text"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
            placeholder=""
            maxlength="100"
            required
          />
        </div>
        <div class="mb-6">
          <label
            for="text"
            class="block mb-2 text-sm font-medium text-gray-900 "
          >
            Código postal
          </label>
          <input
            type="text"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
            placeholder="01000"
            maxlength="10"
            required
          />
        </div>
        <div class="mb-6">
          <label
            for="text"
            class="block mb-2 text-sm font-medium text-gray-900 "
          >
            Regimen fiscal
          </label>
          <input
            type="text"
            id="text"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
            placeholder=""
            maxlength="70"
            required
          />
        </div>
        <div class="mb-6">
          <label
            for="text"
            class="block mb-2 text-sm font-medium text-gray-900 "
          >
            Uso de CDFI
          </label>
          <input
            type="text"
            id="text"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
            placeholder=""
            maxlength="3"
            required
          />
        </div>
        <div class="mb-6">
          <label
            for="email"
            class="block mb-2 text-sm font-medium text-gray-900 "
          >
            Your email
          </label>
          <input
            type="email"
            id="email"
            class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
            placeholder="ejemplo@gmail.com"
            required
          />
        </div>
        <button
          type="submit"
          class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center "
        >
          Enviar
        </button>
      </form>
    </section>
  );
}

export default DatosFiscales;
