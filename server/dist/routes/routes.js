"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = __importDefault(require("../models/User"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const router = (0, express_1.Router)();
router.get('/users', authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User_1.default.find();
        res.status(200).json(users);
    }
    catch (error) {
        console.error('Error al obtener los usuarios', error);
        res.status(500).json({ error: 'Error al obtener los usuarios' });
    }
}));
// Ruta para registrar un nuevo usuario
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, lastName, username, email, password, role } = req.body;
        // Verificar si el usuario ya existe en la base de datos
        const existingUser = yield User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'El usuario ya existe' });
        }
        // Encriptar la contraseña
        const saltRounds = 10;
        const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
        // Crear una nueva instancia del modelo de usuario con los datos proporcionados
        const newUser = new User_1.default({
            firstName,
            lastName,
            username,
            email,
            password: hashedPassword,
            role,
        });
        // Guardar el nuevo usuario en la base de datos
        yield newUser.save();
        res.status(200).json({
            message: 'Usuario registrado exitosamente',
            user: {
                _id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
            },
        });
    }
    catch (error) {
        console.error('Error al registrar el usuario', error);
        res.status(500).json({ error: 'Error al registrar el usuario' });
    }
}));
// Ruta para iniciar sesión
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { usernameOrEmail, password } = req.body;
        // Buscar al usuario en la base de datos por nombre de usuario o correo electrónico
        const user = yield User_1.default.findOne({
            $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
        });
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        // Verificar si la contraseña proporcionada coincide con la almacenada en la base de datos
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }
        // Generar un token JWT con la información del usuario y la clave secreta
        const token = jsonwebtoken_1.default.sign({ userId: user._id, role: user.role }, 'secreto'); // Reemplaza 'secreto' con tu propia clave secreta
        res.status(200).json({
            message: 'Inicio de sesión exitoso',
            token,
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error('Error al iniciar sesión', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
}));
exports.default = router;
