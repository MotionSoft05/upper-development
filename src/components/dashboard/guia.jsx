import React, { useState, useEffect, useReducer } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSync,
  faFilePdf,
  faTimes,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import "firebase/compat/auth";

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

      files.sort((a, b) => {
        const regex = /(\d+)\.pdf/;
        const numberA = parseInt(a.name.match(regex)[1]);
        const numberB = parseInt(b.name.match(regex)[1]);
        return numberA - numberB;
      });

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

      const fileName = `${pdfFile.name.replace(".pdf", "")}_${
        uploadedFiles.length + 1
      }.pdf`;
      const storageRef = firebase.storage().ref();
      const pdfRef = storageRef.child(`pdfs/${fileName}`);

      pdfRef
        .put(pdfFile)
        .then((snapshot) => {
          console.log("PDF subido con éxito", snapshot);

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
          console.error("Error al subir el PDF:", error);
          setIsUploading(false);
        });
    } else {
      console.error("Selecciona un archivo PDF antes de subirlo.");
    }
  };

  const handleDelete = (fileName) => {
    // Manejar la eliminación de PDF
    const storageRef = firebase.storage().ref();
    const pdfRef = storageRef.child(`pdfs/${fileName}`);

    pdfRef
      .delete()
      .then(() => {
        console.log("PDF eliminado con éxito");
        // Actualizar localmente el estado de los archivos eliminando el PDF correspondiente
        setUploadedFiles((prevFiles) =>
          prevFiles.filter((file) => file.name !== fileName)
        );
        setFileUploaded(false);
      })
      .catch((error) => {
        console.error("Error al eliminar el PDF:", error);
      });
  };

  return (
    <section className="px-5 md:px-32">
      <div>
        <div className="p-5">
          <h1 className="mb-4 text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl mb-10">
            Guía de usuario
          </h1>

          {user &&
            (user.email === "uppermex10@gmail.com" ||
              user.email === "ulises.jacobo@hotmail.com" ||
              user.email === "contacto@upperds.mx") && (
              <div className="flex items-center space-x-4">
                <input type="file" accept=".pdf" onChange={handleFileChange} />
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
              </div>
            )}

          <div className="mt-4">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center space-x-4 mb-3">
                <FontAwesomeIcon icon={faFilePdf} size="3x" color="red" />
                <span>{file.name}</span>
                {user &&
                (user.email === "uppermex10@gmail.com" ||
                  user.email === "ulises.jacobo@hotmail.com" ||
                  user.email === "contacto@upperds.mx") ? (
                  <>
                    <button
                      onClick={() => window.open(file.url, "_blank")}
                      className="text-blue-600 ml-2 cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faEye} size="lg" />
                    </button>
                    <button
                      onClick={() => handleDelete(file.name)}
                      className="text-red-600 ml-2 cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faTimes} size="lg" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => window.open(file.url, "_blank")}
                    className="text-blue-600 ml-2 cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faEye} size="lg" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Guia;
