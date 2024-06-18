import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import Select from "react-select";
import auth from "@/firebase/auth";
import db from "@/firebase/firestore";
import Seccion1 from "./Seccion1";
import Seccion2 from "./Seccion2";
import Seccion3 from "./Seccion3";

const PreviewPantallaServicio = () => {
  const [screenNames, setScreenNames] = useState([]);
  const [selectedScreen, setSelectedScreen] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);

  const sectionOptions = [
    { label: "Sección 1", value: "Seccion1" },
    { label: "Sección 2", value: "Seccion2" },
    { label: "Sección 3", value: "Seccion3" },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userEmail = user.email;
        const usersRef = collection(db, "usuarios");
        const q = query(usersRef, where("email", "==", userEmail));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const userData = snapshot.docs[0].data();
          const nombresPantallas = userData.NombrePantallasServicios;
          if (nombresPantallas) {
            const nombresPantallasArray = Object.values(nombresPantallas).map(
              (nombre) => ({
                label: nombre,
                value: nombre,
              })
            );
            setScreenNames(nombresPantallasArray);
          }
        }
      }
    };

    fetchUserData();
  }, []);

  const handleScreenChange = (selectedOption) => {
    setSelectedScreen(selectedOption);
    setSelectedSection(null); // Reset section when a new screen is selected
  };

  const handleSectionChange = (selectedOption) => {
    setSelectedSection(selectedOption);
  };

  const renderSelectedSectionContent = () => {
    switch (selectedSection?.value) {
      case "Seccion1":
        return <Seccion1 />;
      case "Seccion2":
        return <Seccion2 />;
      case "Seccion3":
        return <Seccion3 />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl p-6 mx-auto rounded-md shadow-md bg-gray-800 mt-7">
      <h1 className="text-3xl font-bold text-white capitalize mb-4">
        Vista Previa de Pantalla de Servicios
      </h1>
      <div className="mb-4">
        <Select
          className="basic-single"
          classNamePrefix="select"
          isClearable
          isSearchable
          options={screenNames}
          onChange={handleScreenChange}
          value={selectedScreen}
          placeholder="Selecciona una pantalla"
        />
      </div>
      {selectedScreen && (
        <div className="mb-4">
          <Select
            className="basic-single"
            classNamePrefix="select"
            isClearable
            isSearchable
            options={sectionOptions}
            onChange={handleSectionChange}
            value={selectedSection}
            placeholder="Selecciona una sección"
          />
        </div>
      )}
      <div className="grid grid-cols-1 gap-6">
        {selectedSection && (
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white mb-2">
              {selectedSection.label}
            </h2>
            {renderSelectedSectionContent()}
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewPantallaServicio;
