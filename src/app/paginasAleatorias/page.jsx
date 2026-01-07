"use client";
import { useSearchParams } from "next/navigation"; // obtengo la query para luego extraer el id de usuario y hacer peticion
import dynamic from "next/dynamic";
const QrDinamic = dynamic(() => import("@/components/qrPage/QrPage"), {
  ssr: false,
});

function PaginaLista() {
  // Busco la query "qr" para luego extrar el valor y hacer una peticion
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("qr");
  // console.log("🚀 ~ PaginaLista ~ searchQuery:", searchQuery)

  return (
    <div>
      {/* <h1>Página Dinámica {">>>>>>>>>"} {search}</h1> */}
      {/* <p>Valor de "asdas": {valorAsdas}</p> */}
      <QrDinamic searchQuery={searchQuery} />
    </div>
  );
}
export default PaginaLista;
