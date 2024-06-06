import React, { useState, useEffect, useReducer, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSync,
  faFilePdf,
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
import { firebaseConfig } from "@/firebase/firebaseConfig"; // .env

firebase.initializeApp(firebaseConfig);

const Guia = ({ userData }) => {
  const { t } = useTranslation();
  const [pdfFile, setPdfFile] = useState(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState("guiaDeUsuario");
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const fetchFiles = useCallback(() => {
    const storageRef = firebase.storage().ref(selectedFolder);

    storageRef.listAll().then((result) => {
      const files = result.items.map((item) => {
        return { name: item.name, url: item.getDownloadURL() };
      });

      Promise.all(files.map(async (file) => ({ ...file, url: await file.url })))
        .then((filesWithUrls) => setUploadedFiles(filesWithUrls))
        .catch((error) =>
          console.error("Error al obtener las URL de los archivos:", error)
        );
    });
  }, [selectedFolder]);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser);
      } else {
        setUser(null);
      }
    });

    fetchFiles();

    return () => unsubscribe();
  }, [fileUploaded, fetchFiles]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setPdfFile(file);
    setFileUploaded(false);
  };

  const handleUpload = () => {
    if (pdfFile) {
      setIsUploading(true);

      const fileName = pdfFile.name;
      const storageRef = firebase.storage().ref();
      const pdfRef = storageRef.child(`${selectedFolder}/${fileName}`);

      pdfRef
        .put(pdfFile)
        .then((snapshot) => {
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
          console.error(t("guia.uploadError"), error);
          setIsUploading(false);
        });
    } else {
      console.error(t("guia.selectPdfFile"));
    }
  };

  const handleDelete = (fileName) => {
    const storageRef = firebase.storage().ref();
    const pdfRef = storageRef.child(`${selectedFolder}/${fileName}`);

    pdfRef
      .delete()
      .then(() => {
        console.log(t("guia.deleteSuccess"));
        setUploadedFiles((prevFiles) =>
          prevFiles.filter((file) => file.name !== fileName)
        );
        setFileUploaded(false);
      })
      .catch((error) => {
        console.error(t("guia.deleteError"), error);
      });
  };

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

  const handleFolderChange = (folder) => {
    setSelectedFolder(folder);
    setFileUploaded(false); // Trigger the effect to fetch files
  };

  return (
    <section className="px-5 md:px-32">
      <div>
        <div className="p-5">
          <h1 className="text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl mb-10">
            {t("guia.pageTitle")}
          </h1>

          <main className="shadow-2xl p-4 rounded-lg">
            {/* PESTAÑAS */}
            <div className="text-lg font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
              <ul className="flex flex-wrap -mb-px">
                <li className="mr-2">
                  <button
                    name="guiaDeUsuario"
                    onClick={() => handleFolderChange("guiaDeUsuario")}
                    className={`${
                      selectedFolder === "guiaDeUsuario"
                        ? "border-b-2 border-blue-500"
                        : "hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                    } inline-block p-4 rounded-t-lg`}
                  >
                    <span className="ml-3">{t("guia.usageGuides")}</span>
                  </button>
                </li>
                <li className="mr-2">
                  <button
                    name="downloads"
                    onClick={() => handleFolderChange("downloads")}
                    className={`${
                      selectedFolder === "downloads"
                        ? "border-b-2 border-blue-500"
                        : "hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                    } inline-block p-4 rounded-t-lg`}
                  >
                    <span className="ml-3">{t("guia.downloads")}</span>
                  </button>
                </li>
                <li className="mr-2">
                  <button
                    name="termsAndConditions"
                    onClick={() => handleFolderChange("termsAndConditions")}
                    className={`${
                      selectedFolder === "termsAndConditions"
                        ? "border-b-2 border-blue-500"
                        : "hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                    } inline-block p-4 rounded-t-lg`}
                  >
                    <span className="ml-3">{t("guia.termsAndConditions")}</span>
                  </button>
                </li>
              </ul>
            </div>
            {/* MOSTRAR ARCHIVOS y SUBIR */}
            <div className="mt-4">
              {/* SUBIR ARCHIVOS CON ADMIN */}
              <div className="mb-4">
                {user && userData.permisos === 10 && (
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
                        t("guia.uploadButton")
                      )}
                    </button>
                  </div>
                )}
              </div>
              {/* LISTADO DE ARCHIVOS */}
              <div>
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center max-w-2xl space-x-4 mb-3 p-2 rounded-md bg-slate-100"
                  >
                    <div>
                      {getExtensionIcon(file.name)}
                      <span className="ml-2">{file.name}</span>
                    </div>
                    {/* BOTONES */}
                    <div>
                      {/* VER o DESCARGAR */}
                      <button
                        onClick={() => window.open(file.url, "_blank")}
                        className="text-blue-600 ml-2 cursor-pointer"
                      >
                        <FontAwesomeIcon
                          icon={
                            file.name.slice(-4) === ".rar" ? faDownload : faEye
                          }
                          size="lg"
                        />
                      </button>
                      {/* Eliminar archivo (solo para admin) */}
                      {user && userData.permisos === 10 && (
                        <>
                          <button
                            onClick={() => handleDelete(file.name)}
                            className="text-red-600 ml-4 cursor-pointer"
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
          </main>
        </div>
      </div>
    </section>
  );
};

export default Guia;
