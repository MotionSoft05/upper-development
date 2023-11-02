import Link from "next/link";
import { useState } from "react";

function Pantallas() {
  const [screen1AspectRatio, setScreen1AspectRatio] = useState("16:9");
  const [screen2AspectRatio, setScreen2AspectRatio] = useState("9:16");

  return (
    <section className="pl-14 md:px-32">
      <h1 className="text-3xl font-extrabold text-gray-900">
        Ajuste de pantallas
      </h1>
      <div className="grid grid-cols-2 pt-9">
        <div>
          <div className="border border-black py-28 ">
            <h2>pantalla 1</h2>
            <p>Relación de aspecto: 16:9</p>
          </div>
          <div className="flex justify-center">
            <Link
              href="/pantalla1"
              className=" bg-gray-300 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full active:bg-gray-500"
            >
              pantalla completa
            </Link>
            <button className=" bg-gray-300 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full active:bg-gray-500">
              Editar
            </button>
          </div>
        </div>
        <div>
          <div className="border border-black mx-14 py-44 ">
            <h2>pantalla 2</h2>
            <p>Relación de aspecto: 9:16</p>
          </div>
          <div className="flex justify-center">
            <button className=" bg-gray-300 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full active:bg-gray-500">
              pantalla completa
            </button>
            <button className=" bg-gray-300 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full active:bg-gray-500">
              Editar
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
export default Pantallas;
