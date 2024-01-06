const admin = require("firebase-admin");
const serviceAccount = require("./firebase-credentials.json");

// Inicializar la aplicación Firebase solo si no se ha inicializado previamente
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const auth = admin.auth();

module.exports = auth;
