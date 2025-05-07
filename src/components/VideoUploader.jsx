// src/components/dashboard/VideoUploader.jsx
import React, { useState, useRef } from "react";
import { validateVideo, getVideoThumbnail } from "../utils/videoValidation";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import storage from "../firebase/storage";

const VideoUploader = ({ onVideoUploaded, onError }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [metadata, setMetadata] = useState(null);
  const videoRef = useRef(null);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    try {
      setError(null);

      // Validar video
      const validation = await validateVideo(selectedFile);

      if (!validation.valid) {
        setError(validation.error);
        return;
      }

      // Guardar metadatos
      setMetadata(validation.metadata);

      // Generar vista previa
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
      setFile(selectedFile);

      // Obtener thumbnail
      const thumbnail = await getVideoThumbnail(selectedFile);
      // Aquí podrías mostrar el thumbnail o guardarlo
    } catch (err) {
      console.error("Error al procesar video:", err);
      setError("Error al procesar el archivo de video");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);

      // Crear referencia de almacenamiento con nombre único
      const timestamp = new Date().getTime();
      const filename = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, `videos/${filename}`);

      // Iniciar carga con seguimiento de progreso
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          duration: metadata?.duration.toString() || "0",
          width: metadata?.width.toString() || "0",
          height: metadata?.height.toString() || "0",
        },
      });

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setProgress(progress);
        },
        (error) => {
          console.error("Error al subir:", error);
          setError("Error al subir el video");
          setUploading(false);
          if (onError) onError(error);
        },
        async () => {
          // Carga completada
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          if (onVideoUploaded) {
            onVideoUploaded({
              url: downloadURL,
              filename,
              metadata: {
                duration: metadata?.duration || 0,
                width: metadata?.width || 0,
                height: metadata?.height || 0,
                size: file.size,
                type: file.type,
              },
            });
          }

          // Limpiar estado
          setUploading(false);
          setProgress(0);
          setFile(null);
          setPreview(null);
        }
      );
    } catch (err) {
      console.error("Error en carga:", err);
      setError("Error al iniciar la carga del video");
      setUploading(false);
      if (onError) onError(err);
    }
  };

  const cancelUpload = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview(null);
    setError(null);
    setProgress(0);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium mb-4">Subir Video</h3>

      {/* Sección de información */}
      <div className="mb-4 bg-blue-50 p-3 rounded text-sm">
        <h4 className="font-bold text-blue-700 mb-1">Requisitos de video:</h4>
        <ul className="list-disc pl-5 space-y-1 text-blue-800">
          <li>Tamaño máximo: 15MB</li>
          <li>Duración máxima: 60 segundos</li>
          <li>Formatos permitidos: MP4, WEBM</li>
          <li>Resolución máxima: 720p (1280×720)</li>
        </ul>
      </div>

      {/* Vista previa del video */}
      {preview && (
        <div className="mb-4 border rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            src={preview}
            className="w-full h-64 object-contain bg-black"
            controls
          />

          {metadata && (
            <div className="p-3 bg-gray-50 text-sm">
              <p>Duración: {Math.round(metadata.duration)} segundos</p>
              <p>
                Resolución: {metadata.width}x{metadata.height}
              </p>
              <p>
                Tamaño: {Math.round((file.size / 1024 / 1024) * 10) / 10} MB
              </p>
            </div>
          )}
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">{error}</div>
      )}

      {/* Control de carga */}
      {!uploading && !file && (
        <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg">
          <label className="cursor-pointer flex flex-col items-center">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className="mt-2 text-sm text-gray-600">
              Seleccionar video
            </span>
            <input
              type="file"
              accept="video/mp4,video/webm"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>
      )}

      {/* Barra de progreso */}
      {uploading && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-center mt-2">Subiendo: {progress}%</p>
        </div>
      )}

      {/* Botones de acción */}
      {file && !uploading && (
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={cancelUpload}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleUpload}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Subir Video
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoUploader;
