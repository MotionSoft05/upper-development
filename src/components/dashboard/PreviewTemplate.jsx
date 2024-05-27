// src/components/PantallaServicio.js

import React from "react";

const PantallaServicio = () => {
  return (
    <div
      className="w-full h-full bg-red-100 grid grid-rows-6 gap-1"
      style={{ aspectRatio: "16 / 9" }}
    >
      <div className="grid grid-cols-3 gap-1 mb-1 h-full row-span-5">
        <div className="grid grid-rows-2 gap-1">
          <div className="bg-cyan-200 border-2 border-slate-300 p-1">
            IMAGEN
          </div>
          <div className="bg-cyan-200 border-2 border-slate-300 p-1">
            IMAGEN
          </div>
        </div>
        <div className="bg-green-100 col-span-2 border-2 border-slate-300 p-1">
          IMAGEN O VIDEO
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1 h-full flex-grow row-span-1">
        <div className="bg-orange-200 border-2 border-slate-300 p-1">FECHA</div>
        <div className="bg-orange-200 border-2 border-slate-300 p-1">RSS</div>
        <div className="bg-orange-200 border-2 border-slate-300 p-1">CLIMA</div>
      </div>
    </div>
  );
};

export default PantallaServicio;
