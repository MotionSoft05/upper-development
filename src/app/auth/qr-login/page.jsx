// src/app/auth/qr-login/page.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import auth from '@/firebase/auth';
import db from '@/firebase/firestore';
import Link from 'next/link';

export default function QRLogin() {
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState(null);
  const [sessionValid, setSessionValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const session = searchParams.get('session');
    console.log('Session ID from URL:', session);
    
    if (session) {
      setSessionId(session);
      validateSession(session);
    } else {
      setError('No se proporcionó ID de sesión');
      setLoading(false);
    }
  }, [searchParams]);

  const validateSession = async (sessionId) => {
    try {
      console.log('Validating session:', sessionId);
      const sessionRef = doc(db, 'qr_sessions', sessionId);
      const sessionDoc = await getDoc(sessionRef);
      
      if (!sessionDoc.exists()) {
        console.log('Session document not found');
        setError('Sesión no encontrada o expirada');
        return;
      }

      const sessionData = sessionDoc.data();
      console.log('Session data:', sessionData);
      
      if (sessionData.status !== 'pending') {
        setError(`Sesión no válida (estado: ${sessionData.status})`);
        return;
      }

      // Verificar expiración
      const now = new Date();
      const expiresAt = sessionData.expiresAt?.toDate ? sessionData.expiresAt.toDate() : new Date(sessionData.expiresAt);
      
      if (now > expiresAt) {
        setError('La sesión ha expirado');
        return;
      }

      console.log('Session is valid');
      setSessionValid(true);
    } catch (error) {
      console.error('Error validating session:', error);
      setError('Error al validar la sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setError('');

    try {
      console.log('Starting login process...');
      
      // Autenticación normal con Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        loginData.email, 
        loginData.password
      );

      console.log('User authenticated:', userCredential.user.uid);

      // Obtener datos completos del usuario desde Firestore
      const userRef = doc(db, 'usuarios', userCredential.user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('No se encontraron datos del usuario en la base de datos');
      }

      const userData = userDoc.data();
      console.log('User data retrieved:', { 
        email: userData.email, 
        empresa: userData.empresa,
        nombre: userData.nombre 
      });

      // Preparar datos completos para la TV
      const completeUserData = {
        uid: userCredential.user.uid,
        email: userData.email,
        nombre: userData.nombre,
        apellido: userData.apellido,
        empresa: userData.empresa,
        telefono: userData.telefono,
        
        // Licencias de pantallas
        pd: userData.pd || 0,  // Pantallas Directorio
        ps: userData.ps || 0,  // Pantallas Salón
        pp: userData.pp || 0,  // Pantallas Promociones
        
        // Nombres de pantallas
        nombrePantallas: userData.nombrePantallas || {},
        nombrePantallasDirectorio: userData.nombrePantallasDirectorio || {},
        nombrePantallasPromociones: userData.nombrePantallasPromociones || {},
        NombrePantallasServicios: userData.NombrePantallasServicios || {},
        
        // Otros campos que pueda necesitar la app
        sesion: userData.sesion || 0,
        status: userData.status,
        total: userData.total || 0,
        
        // Timestamp de autenticación
        authenticatedAt: new Date().toISOString()
      };

      console.log('Updating QR session with user data...');

      // Actualizar la sesión QR con los datos del usuario
      const sessionRef = doc(db, 'qr_sessions', sessionId);
      await updateDoc(sessionRef, {
        status: 'completed',
        userData: completeUserData,
        completedAt: new Date(),
        updatedAt: new Date()
      });

      console.log('QR session updated successfully');
      setSuccess(true);
      
      // Auto-cerrar después de 5 segundos
      setTimeout(() => {
        window.close();
      }, 5000);

    } catch (error) {
      console.error('Login error:', error);
      
      // Manejar errores específicos de Firebase Auth
      let errorMessage = 'Error al iniciar sesión';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Usuario no encontrado';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Contraseña incorrecta';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Demasiados intentos. Intenta más tarde';
          break;
        default:
          errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoginLoading(false);
    }
  };

  // Estados de carga y error
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Validando sesión...</p>
        </div>
      </div>
    );
  }

  if (error && !sessionValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Sesión No Válida</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Por favor, genera un nuevo código QR desde tu TV e intenta nuevamente.
          </p>
          <Link href="/" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Ir al inicio
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Autenticación Exitosa!</h1>
          <p className="text-gray-600 mb-4">
            Tu TV se ha autenticado correctamente. Puedes cerrar esta ventana.
          </p>
          <p className="text-sm text-gray-500">
            Esta ventana se cerrará automáticamente en unos segundos.
          </p>
          <button 
            onClick={() => window.close()}
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Cerrar ventana
          </button>
        </div>
      </div>
    );
  }

  // Formulario de login
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img className="mx-auto h-16 w-auto" src="/img/logov2.png" alt="Upper Logo" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Iniciar sesión en TV
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Inicia sesión para autenticar tu dispositivo TV
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="tu@email.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Tu contraseña"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <img src="/img/ojo.png" alt="Hide password" className="w-6 h-6" />
                  ) : (
                    <img src="/img/ojosno.png" alt="Show password" className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loginLoading || !loginData.email || !loginData.password}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loginLoading || !loginData.email || !loginData.password
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {loginLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Autenticando...
                </div>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}