// src/components/auth/Unauthorized.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-screen p-4">
    <h1 className="text-3xl font-bold mb-2">403 — Unauthorized</h1>
    <p className="mb-4">You don’t have permission to view this page.</p>
    <Link
      to="/"
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Back to Home
    </Link>
  </div>
);

export default Unauthorized;
