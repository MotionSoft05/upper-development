import React, { useState, useEffect, useReducer } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSync,
  faFilePdf,
  faBook,
  faTimes,
  faEye,
  faFile,
  faDownload,
  faFileZipper,
} from "@fortawesome/free-solid-svg-icons";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import "firebase/compat/auth";
import { useTranslation } from "react-i18next";

const firebaseConfig = {
  apiKey: "AIzaSyAiP1248hBEZt3iS2H4UVVjdf_xbuJHD3k",
  authDomain: "upper-8c817.firebaseapp.com",
  projectId: "upper-8c817",
  storageBucket: "upper-8c817.appspot.com",
  messagingSenderId: "798455798906",
  appId: "1:798455798906:web:f58a3e51b42eebb6436fc3",
  measurementId: "G-6VHX927GH1",
};

firebase.initializeApp(firebaseConfig);

const Guia = () => {
  const { t } = useTranslation();
  const [pdfFile, setPdfFile] = useState(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [user, setUser] = useState(null);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser);
      } else {
        setUser(null);
      }
    });

    const storageRef = firebase.storage().ref("pdfs");

    storageRef.listAll().then((result) => {
      const files = result.items.map((item) => {
        return { name: item.name, url: item.getDownloadURL() };
      });

      // files.sort((a, b) => {
      //   const regex = /(\d+)\.pdf/;
      //   const numberA = parseInt(a.name.match(regex)[1]);
      //   const numberB = parseInt(b.name.match(regex)[1]);
      //   return numberA - numberB;
      // });

      Promise.all(files.map(async (file) => ({ ...file, url: await file.url })))
        .then((filesWithUrls) => setUploadedFiles(filesWithUrls))
        .catch((error) =>
          console.error("Error al obtener las URL de los archivos:", error)
        );
    });

    return () => unsubscribe();
  }, [fileUploaded]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setPdfFile(file);
    setFileUploaded(false);
  };

  const handleUpload = () => {
    if (pdfFile) {
      setIsUploading(true);

      //     const fileName = `${pdfFile.name.replace(".pdf", "")}_${
      //       uploadedFiles.length + 1
      //     }.pdf`;
      const fileName = pdfFile.name;
      const storageRef = firebase.storage().ref();
      const pdfRef = storageRef.child(`pdfs/${fileName}`);

      pdfRef
        .put(pdfFile)
        .then((snapshot) => {
          // "PDF cargado con éxito"
          console.log(t("guia.uploadSuccess"), snapshot);

          pdfRef.getDownloadURL().then((url) => {
            setPdfFile({ ...pdfFile, url });
            setFileUploaded(true);
            setIsUploading(false);

            setUploadedFiles((prevFiles) => [
              ...prevFiles,
              { name: fileName, url },
            ]);
          });
        })
        .catch((error) => {
          // "Error al subir el PDF:";
          console.error(t("guia.uploadError"), error);
          setIsUploading(false);
        });
    } else {
      // console.error("Selecciona un archivo PDF antes de subirlo.");
      console.error(t("guia.selectPdfFile"));
    }
  };

  const handleDelete = (fileName) => {
    // Manejar la eliminación de PDF
    const storageRef = firebase.storage().ref();
    const pdfRef = storageRef.child(`pdfs/${fileName}`);

    pdfRef
      .delete()
      .then(() => {
        // console.log("PDF eliminado con éxito");
        console.log(t("guia.deleteSuccess"));
        // Actualizar localmente el estado de los archivos eliminando el PDF correspondiente
        setUploadedFiles((prevFiles) =>
          prevFiles.filter((file) => file.name !== fileName)
        );
        setFileUploaded(false);
      })
      .catch((error) => {
        // "Error al eliminar el PDF:"
        console.error(t("guia.deleteError"), error);
      });
  };

  //Función que renderiza el icono dependiendo la extensión del archivo
  const getExtensionIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    switch (extension) {
      case "pdf":
        return <FontAwesomeIcon icon={faFilePdf} size="2x" color="red" />;
      case "zip":
      case "rar":
        return <FontAwesomeIcon icon={faFileZipper} size="2x" color="red" />;
      default:
        return <FontAwesomeIcon icon={faFile} size="2x" color="red" />;
    }
  };

  return (
    <section className="px-5 md:px-32">
      <div>
        <div className="p-5">
          <h1 className=" text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl mb-10">
            {/* Guía de usuario */}
            {t("guia.pageTitle")}
          </h1>

          {user &&
            (user.email === "uppermex10@gmail.com" ||
              user.email === "ulises.jacobo@hotmail.com" ||
              user.email === "contacto@upperds.mx") && (
              <div className="flex items-center space-x-4">
                <input type="file" onChange={handleFileChange} />
                <button
                  onClick={handleUpload}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <FontAwesomeIcon icon={faSync} spin size="lg" />
                  ) : (
                    // "Subir PDF"
                    t("guia.uploadButton")
                  )}
                </button>
              </div>
            )}

          <div className="mt-4">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex justify-between items-center max-w-2xl space-x-4 mb-3 p-2 rounded-md bg-slate-100"
              >
                {/* Icono y Nombre del archivo */}
                <div>
                  {/* Funcion "getExtensionIcon" para mostar icono segun el tipo de archivo */}
                  {getExtensionIcon(file.name)}
                  <span className="ml-2">{file.name}</span>
                </div>
                {/* Boton para ver o descargar */}
                <div>
                  <button
                    onClick={() => window.open(file.url, "_blank")}
                    className="text-blue-600 ml-2 cursor-pointer"
                  >
                    {/* Si es RAR, se muestra el icono de descarga, sino, se muestra el icono de ver */}
                    <FontAwesomeIcon
                      icon={file.name.slice(-4) === ".rar" ? faDownload : faEye}
                      size="lg"
                    />
                  </button>

                  {/* Si es Admin, se muestra el boton para eliminar archivos*/}
                  {user &&
                    (user.email === "uppermex10@gmail.com" ||
                      user.email === "ulises.jacobo@hotmail.com" ||
                      user.email === "contacto@upperds.mx") && (
                      <>
                        <button
                          onClick={() => handleDelete(file.name)}
                          className="text-red-600 ml-2 cursor-pointer"
                        >
                          <FontAwesomeIcon icon={faTimes} size="lg" />
                        </button>
                      </>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Guia;
