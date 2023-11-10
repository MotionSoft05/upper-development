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

      <div class="relative overflow-x-auto">
        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" class="px-6 py-3">
                Nombre
              </th>
              <th scope="col" class="px-6 py-3">
                Editar
              </th>
              <th scope="col" class="px-6 py-3">
                Ver pantalla
              </th>
            </tr>
          </thead>
          <tbody>
            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <th
                scope="row"
                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
              >
                pantalla1
              </th>

              <td class="px-6 py-4">
                <button className=" bg-gray-300 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full active:bg-gray-500">
                  Editar
                </button>
              </td>
              <td class="px-6 py-4">
                <Link
                  href="/pantalla1"
                  className=" bg-gray-300 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full active:bg-gray-500"
                >
                  pantalla completa
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
export default Pantallas;
