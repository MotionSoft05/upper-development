// // templates/DirectoryTemplateManager.jsx
// import { PDTemplate1 } from "./PDTemplate1";

// const DirectoryTemplateManager = ({ screenData, currentTime, isPortrait }) => {
//   return (
//     <PDTemplate1
//       events={screenData.events}
//       ads={screenData.ads}
//       currentTime={currentTime}
//       isPortrait={isPortrait}
//     />
//   );
// };

// export default DirectoryTemplateManager;

// // templates/PDTemplate1.jsx
// import React from "react";

// // export const PDTemplate1 = ({ events, ads, currentTime, isPortrait }) => {
// //   return (
// //     <div
// //       className={`min-h-screen p-8 ${isPortrait ? "portrait" : "landscape"}`}
// //     >
// //       <div className="mb-4 text-2xl font-bold text-right">{currentTime}</div>

// //       {/* Eventos */}
// //       {events.length > 0 ? (
// //         <div className="space-y-4">
// //           <h2 className="text-3xl font-bold mb-6">Eventos Actuales</h2>
// //           {events.map((event) => (
// //             <div key={event.id} className="p-4 bg-white rounded-lg shadow-md">
// //               <h3 className="text-xl font-semibold">{event.nombreEvento}</h3>
// //               <p className="text-gray-600">Salón: {event.salon}</p>
// //               <p className="text-gray-600">
// //                 Horario: {event.horaInicialSalon} - {event.horaFinalSalon}
// //               </p>
// //             </div>
// //           ))}
// //         </div>
// //       ) : ads.length > 0 ? (
// //         <div className="space-y-4">
// //           <h2 className="text-3xl font-bold mb-6">Anuncios</h2>
// //           {ads.map((ad) => (
// //             <div key={ad.id} className="p-4 bg-white rounded-lg shadow-md">
// //               <h3 className="text-xl font-semibold">{ad.titulo}</h3>
// //               <p className="text-gray-600">{ad.descripcion}</p>
// //             </div>
// //           ))}
// //         </div>
// //       ) : (
// //         <div className="flex justify-center items-center h-[60vh]">
// //           <p className="text-2xl text-gray-500">
// //             No hay eventos o anuncios disponibles
// //           </p>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };
