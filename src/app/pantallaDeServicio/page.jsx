function PantallaServicio() {
  return (
    <div className="min-h-screen bg-red-100 grid grid-rows-6">

      {/* SECCION 1, 2, 3 */}
      <div className="grid grid-cols-3 gap-1 mb-1 h-full row-span-5">

        {/* Seccion superior izquierda */}
        <div className="grid grid-rows-2 gap-1 ">
          <div className="bg-cyan-200 border-2 border-slate-300 p-1">
            seccion 1
          </div>
          <div className="bg-cyan-200 border-2 border-slate-300 p-1">
            seccion 2
          </div>
        </div>

        {/* Seccion superior derecha */}
        <div className="bg-green-100 col-span-2 border-2 border-slate-300 p-1">
          seccion 3
        </div>
      </div>

      {/* SECCION FECHA, RSS, CLIMA */}
      <div className="grid grid-cols-3 gap-1 h-full flex-grow row-span-1">
        <div className="bg-orange-200 border-2 border-slate-300 p-1">
          section
        </div>
        <div className="bg-orange-200 border-2 border-slate-300 p-1">
          section
        </div>
        <div className="bg-orange-200 border-2 border-slate-300 p-1">
          section
        </div>
      </div>
    </div>
  );
}

export default PantallaServicio;
