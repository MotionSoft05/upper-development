import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface DecodedToken {
    userId: string;
    role: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: DecodedToken;
        }
    }
}

function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ error: 'Acceso no autorizado' });
    }

    try {
        const decodedToken: any = jwt.verify(token, 'secreto'); // Reemplaza 'secreto' con tu propia clave secreta
        if (decodedToken.role !== 'admin') {
            return res.status(403).json({ error: 'Acceso no autorizado' });
        }
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Error al verificar el token', error);
        res.status(500).json({ error: 'Error al verificar el token' });
    }
}

export default authMiddleware;
