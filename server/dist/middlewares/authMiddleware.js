"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authMiddleware(req, res, next) {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ error: 'Acceso no autorizado' });
    }
    try {
        const decodedToken = jsonwebtoken_1.default.verify(token, 'secreto'); // Reemplaza 'secreto' con tu propia clave secreta
        if (decodedToken.role !== 'admin') {
            return res.status(403).json({ error: 'Acceso no autorizado' });
        }
        req.user = decodedToken;
        next();
    }
    catch (error) {
        console.error('Error al verificar el token', error);
        res.status(500).json({ error: 'Error al verificar el token' });
    }
}
exports.default = authMiddleware;
