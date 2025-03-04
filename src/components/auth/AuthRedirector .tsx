// components/AuthRedirector.jsx
import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

export default function AuthRedirector() {
  const { isLoaded, userId, getToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserRole = async () => {
      if (!isLoaded) return;

      if (!userId) {
        navigate('/login');
        return;
      }

      try {
        const token = await getToken();
        const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const userData = await response.json();
          navigate(`/${userData.role}-dashboard`);
        } else {
          navigate('/role-selection');
        }
      } catch (error) {
        console.error('Error checking role:', error);
        navigate('/login');
      }
    };

    checkUserRole();
  }, [isLoaded, userId, navigate, getToken]);

  return <div>Loading...</div>;
}