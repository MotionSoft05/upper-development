function Pantalla4() {
  return (
    <section className="relative inset-0 w-full min-h-screen md:fixed sm:fixed min-[120px]:fixed bg-white">
      <div className="bg-white  text-black h-full flex flex-col justify-center">
        <div className="flex items-center justify-between">
          <img src="/img/fiestamericana.png" alt="Logo" className="  w-96" />
          <h1 className="font-bold text-5xl mr-16">SALON LAUREL</h1>
        </div>
        <div className="bg-gradient-to-t from-gray-50  to-white text-gray-50">
          <div className=" mx-2">
            <div
              className={`text-white py-5 text-5xl font-bold bg-gradient-to-r from-black to-black px-20 rounded-t-xl`}
            >
              <h2>REUNION DE FIN DE CURSO</h2>
            </div>
            <div className="grid grid-cols-[max-content_1fr] gap-x-4 text-black">
              <div className="mr-4 my-4">
                <img className="w-96 ml-12" src="/img/imgTemplate.png" />
              </div>

              <div className=" space-y-8 pl-10 mb-12 my-4">
                <div>
                  <h1 className="text-4xl font-bold">Sesión:</h1>
                  <p className="text-4xl font-bold">
                    Hora Inicial
                    <span className="text-2x1">hrs.</span>
                  </p>
                </div>
                <div className="max-w-xs">
                  {/* Tipo de evento y descripción */}
                  <h1 className="text-4xl font-bold">
                    Tipo de Evento Desconocido
                  </h1>
                  <div className="text-center flex px-0">
                    <p className=" text-4xl font-bold text-left">EJEMPLO</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="text-4xl py-4 font-semibold mt-1 text-center bg-gradient-to-r from-black to-black justify-between flex px-20 rounded-b-xl ">
                <p>VIERNES 3 DE NOVIEMBRE 2023 </p>
                <p>01:12:13</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Pantalla4;
