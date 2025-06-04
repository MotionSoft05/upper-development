// src/components/QRSessionDebug.jsx (Opcional - Solo para desarrollo)
"use client";
import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import db from '@/firebase/firestore';

export default function QRSessionDebug({ sessionId }) {
  const [sessionData, setSessionData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) return;

    console.log('🔍 Monitoring QR session:', sessionId);

    const sessionRef = doc(db, 'qr_sessions', sessionId);
    
    const unsubscribe = onSnapshot(
      sessionRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          console.log('📊 Session data updated:', data);
          setSessionData(data);
        } else {
          console.log('❌ Session document does not exist');
          setError('Session not found');
        }
      },
      (error) => {
        console.error('🚫 Error monitoring session:', error);
        setError(error.message);
      }
    );

    return () => unsubscribe();
  }, [sessionId]);

  // Solo mostrar en modo desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (error) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-sm">
        <strong className="font-bold">Debug Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded max-w-sm">
        <strong className="font-bold">Debug: </strong>
        <span className="block sm:inline">Loading session data...</span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded max-w-sm text-xs">
      <strong className="font-bold">QR Session Debug:</strong>
      <div className="mt-2">
        <div><strong>ID:</strong> {sessionId}</div>
        <div><strong>Status:</strong> {sessionData.status}</div>
        <div><strong>Created:</strong> {sessionData.createdAt?.toDate?.()?.toLocaleTimeString() || 'N/A'}</div>
        <div><strong>Expires:</strong> {sessionData.expiresAt?.toDate?.()?.toLocaleTimeString() || 'N/A'}</div>
        {sessionData.userData && (
          <div><strong>User:</strong> {sessionData.userData.email}</div>
        )}
        {sessionData.completedAt && (
          <div><strong>Completed:</strong> {sessionData.completedAt?.toDate?.()?.toLocaleTimeString() || 'N/A'}</div>
        )}
      </div>
    </div>
  );
}