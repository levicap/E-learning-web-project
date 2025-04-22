// src/components/auth/ProtectedRoute.tsx
import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Navigate, useLocation } from 'react-router-dom';

type Role = 'admin' | 'teacher' | 'student';

interface ProtectedRouteProps {
  allowedRoles: Role[];
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, isLoaded } = useUser();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (!isLoaded || !user) return;
    fetch(`http://localhost:5000/api/users/${user.id}`)
      .then(res => res.json())
      .then(data => {
        setRole(data.role);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [isLoaded, user]);

  if (!isLoaded || loading) {
    return <div>Loading…</div>;
  }

  if (role && allowedRoles.includes(role as Role)) {
    return children;
  }

  return (
    <Navigate
      to="/unauthorized"
      state={{ from: location }}
      replace
    />
  );
};

export default ProtectedRoute;
