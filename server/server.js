// server.js

const express = require("express");
const app = express();
const auth = require("./firebaseAdmin");
const cors = require("cors");

const allowedOrigins = ["http://localhost:3000", "https://upperds.mx/"];

app.use(
  cors({
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
    credentials: true,
    origin: (origin, callback) => {
      // Permitir cualquier origen si no se especifica (por ejemplo, solicitudes locales)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Ruta para eliminar usuario
app.delete("/eliminar-usuario/:uid", async (req, res) => {
  const uid = req.params.uid;

  res.header("Access-Control-Allow-Origin", "*");

  try {
    await auth.deleteUser(uid);
    res
      .status(200)
      .json({ mensaje: `Usuario con UID ${uid} eliminado correctamente.` });
  } catch (error) {
    console.error(
      "Error al eliminar usuario de Firebase Authentication:",
      error
    );
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor en ejecución en https://localhost:${PORT}`);
});
