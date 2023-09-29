import { Router, Request, Response } from 'express';
import User, { IUser } from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authMiddleware from '../middlewares/authMiddleware';

const router: Router = Router();

router.get('/users', authMiddleware, async (req: Request, res: Response) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error al obtener los usuarios', error);
        res.status(500).json({ error: 'Error al obtener los usuarios' });
    }
});

// Ruta para registrar un nuevo usuario
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, phone, email, password, role } = req.body;

        // Verificar si el usuario ya existe en la base de datos
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'El usuario ya existe' });
        }

        // Encriptar la contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Crear una nueva instancia del modelo de usuario con los datos proporcionados
        const newUser: IUser = new User({
            firstName,
            lastName,
            phone,
            email,
            password: hashedPassword,
            role,
        });

        // Guardar el nuevo usuario en la base de datos
        await newUser.save();

        res.status(200).json({
            message: 'Usuario registrado exitosamente',
            user: {
                _id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                phone: newUser.phone,
                email: newUser.email,
                role: newUser.role,
            },
        });
    } catch (error) {
        console.error('Error al registrar el usuario', error);
        res.status(500).json({ error: 'Error al registrar el usuario' });
    }
});

// Ruta para iniciar sesión
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { phone, password } = req.body;

        // Buscar al usuario en la base de datos por número de teléfono
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Verificar si la contraseña proporcionada coincide con la almacenada en la base de datos
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        // Generar un token JWT con la información del usuario y la clave secreta
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            'secreto'
        ); // Reemplaza 'secreto' con tu propia clave secreta

        res.status(200).json({
            message: 'Inicio de sesión exitoso',
            token,
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Error al iniciar sesión', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

export default router;
