// server.js

const express = require("express");
const app = express();
const axios = require("axios");
const cors = require("cors");

const parser = require("fast-xml-parser");

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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor en ejecución en https://localhost:${PORT}`);
});
