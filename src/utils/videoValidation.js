// src/utils/videoValidation.js
export const validateVideo = async (file) => {
  // Validar tamaño
  if (file.size > 15 * 1024 * 1024) {
    return {
      valid: false,
      error: "El archivo excede el tamaño máximo de 15MB",
    };
  }

  // Validar formato
  const validFormats = ["video/mp4", "video/webm"];
  if (!validFormats.includes(file.type)) {
    return {
      valid: false,
      error: "Formato de video no soportado. Utilice MP4 o WEBM",
    };
  }

  // Validar duración (requiere cargar el video en un elemento)
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      if (video.duration > 60) {
        resolve({
          valid: false,
          error: "La duración del video excede el límite de 60 segundos",
          metadata: {
            duration: video.duration,
            width: video.videoWidth,
            height: video.videoHeight,
          },
        });
      } else {
        resolve({
          valid: true,
          metadata: {
            duration: video.duration,
            width: video.videoWidth,
            height: video.videoHeight,
          },
        });
      }
    };

    video.src = URL.createObjectURL(file);
  });
};

export const getVideoThumbnail = async (file) => {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");

    video.onloadeddata = () => {
      video.currentTime = 1; // Capturar frame en el segundo 1
    };

    video.onseeked = () => {
      const ctx = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        "image/jpeg",
        0.7
      );
    };

    video.src = URL.createObjectURL(file);
  });
};
