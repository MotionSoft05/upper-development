const cool = require("cool-ascii-faces");
const express = require("express");
const path = require("path");
const axios = require("axios");
const cors = require("cors");
const auth = require("./firebaseAdmin");
const parser = require("fast-xml-parser");

const app = express();

const corsOptions = {
  origin: "*",
  credentials: true,
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
};

app.use(cors(corsOptions));

// Ruta para obtener información de RSS
app.get("/fetch-rss", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");

  try {
    const response = await axios.get(
      "https://editorial.aristeguinoticias.com/feed/"
    );
    const jsonObj = parser.parse(response.data);

    const items = jsonObj.rss.channel.item.map((item) => ({
      title: item.title,
      link: item.link,
      description: item.description,
      // ... otros campos que desees obtener
    }));

    res.status(200).json({ items });
  } catch (error) {
    console.error("Error fetching or parsing data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

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

// Rutas del código original
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Ruta para la página principal
app.get("/", (req, res) => res.render("pages/index"));

// Ruta para la función 'cool'
app.get("/cool", (req, res) => res.send(cool()));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
