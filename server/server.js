// server.js

const express = require("express");
const app = express();
const auth = require("./firebaseAdmin");
const cors = require("cors");

app.use(cors());

// Ruta para eliminar usuario
app.delete("/eliminar-usuario/:uid", async (req, res) => {
  const uid = req.params.uid;

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
  console.log(`Servidor en ejecución en http://localhost:${PORT}`);
});
