import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import "firebase/compat/auth"; // Asegúrate de importar el módulo de autenticación

const firebaseConfig = {
  apiKey: "AIzaSyDpo0u-nVMA4LnbInj_qAkzcUfNtT8h29o",
  authDomain: "upper-b0be3.firebaseapp.com",
  projectId: "upper-b0be3",
  storageBucket: "upper-b0be3.appspot.com",
  messagingSenderId: "295362615418",
  appId: "1:295362615418:web:c22cac2f406e4596c2c3c3",
  measurementId: "G-2E66K5XY81",
};

firebase.initializeApp(firebaseConfig);

const Guia = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [user, setUser] = useState(null); // Estado para almacenar información del usuario actual

  useEffect(() => {
    // Obtener información del usuario actual al cargar la guía de usuario
    const unsubscribe = firebase.auth().onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser);
      } else {
        setUser(null);
      }
    });

    // Obtener todos los PDFs al cargar la guía de usuario
    const storageRef = firebase.storage().ref("pdfs");

    storageRef.listAll().then((result) => {
      const files = result.items.map((item) => {
        return { name: item.name, url: item.getDownloadURL() };
      });

      // Extraer el número al final del nombre del archivo y ordenar según ese número
      files.sort((a, b) => {
        const regex = /(\d+)\.pdf/;
        const numberA = parseInt(a.name.match(regex)[1]);
        const numberB = parseInt(b.name.match(regex)[1]);
        return numberA - numberB;
      });

      // Usar Promise.all para esperar todas las promesas antes de actualizar el estado
      Promise.all(files.map(async (file) => ({ ...file, url: await file.url })))
        .then((filesWithUrls) => setUploadedFiles(filesWithUrls))
        .catch((error) =>
          console.error("Error al obtener las URL de los archivos:", error)
        );
    });

    return () => unsubscribe(); // Limpieza del efecto al desmontar el componente
  }, [fileUploaded]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setPdfFile(file);
    setFileUploaded(false);
  };

  const handleUpload = () => {
    if (pdfFile) {
      setIsUploading(true);

      const fileName = `${pdfFile.name.replace(".pdf", "")}_${
        uploadedFiles.length + 1
      }.pdf`;
      const storageRef = firebase.storage().ref();
      const pdfRef = storageRef.child(`pdfs/${fileName}`);

      pdfRef
        .put(pdfFile)
        .then((snapshot) => {
          console.log("PDF subido con éxito", snapshot);

          // Obtener la URL del archivo recién subido
          pdfRef.getDownloadURL().then((url) => {
            setPdfFile({ ...pdfFile, url });
            setFileUploaded(true);
            setIsUploading(false);

            // Agregar el nuevo archivo a la lista de archivos cargados
            setUploadedFiles((prevFiles) => [
              ...prevFiles,
              { name: fileName, url },
            ]);
          });
        })
        .catch((error) => {
          console.error("Error al subir el PDF:", error);
          setIsUploading(false);
        });
    } else {
      console.error("Selecciona un archivo PDF antes de subirlo.");
    }
  };

  return (
    <section className="px-5 md:px-32">
      <div>
        <div className="p-5">
          <h1 className="mb-4 text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl">
            Guía de usuario
          </h1>

          {user && // Mostrar solo a los usuarios autenticados
            (user.email === "uppermex10@gmail.com" ||
              user.email === "ulises.jacobo@hotmail.com") && (
              <div className="flex items-center space-x-4">
                {/* Input para seleccionar un archivo PDF */}
                <input type="file" accept=".pdf" onChange={handleFileChange} />

                {/* Botón para subir el PDF */}
                <button
                  onClick={handleUpload}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <FontAwesomeIcon icon={faSync} spin size="lg" />
                  ) : (
                    "Subir PDF"
                  )}
                </button>

                {/* Enlace para descargar el PDF subido */}
                {fileUploaded && pdfFile && (
                  <a
                    href={pdfFile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Ver PDF
                  </a>
                )}
              </div>
            )}

          {/* Lista de archivos subidos */}
          <div className="mt-4">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 cursor-pointer mb-3"
                onClick={() => window.open(file.url, "_blank")}
              >
                <FontAwesomeIcon icon={faFilePdf} size="3x" color="red" />
                <span>{file.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Guia;
