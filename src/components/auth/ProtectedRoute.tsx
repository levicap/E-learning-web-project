// // components/ProtectedRoute.jsx
// import { useEffect } from 'react';
// import { useAuth } from '@clerk/clerk-react';
// import { useNavigate } from 'react-router-dom';

// export default function ProtectedRoute({ allowedRoles, children }) {
//   const { isLoaded, userId, getToken } = useAuth();
//   const navigate = useNavigate();

//   useEffect(() => {
//     const verifyAccess = async () => {
//       if (!isLoaded || !userId) return;

//       try {
//         const token = await getToken();
//         const response = await fetch('http://localhost:3001/api/users/me', {
//           headers: { Authorization: `Bearer ${token}` }
//         });

//         if (response.ok) {
//           const userData = await response.json();
//           if (!allowedRoles.includes(userData.role)) {
//             navigate(`/${userData.role}-dashboard`);
//           }
//         } else {
//           navigate('/role-selection');
//         }
//       } catch (error) {
//         console.error('Error verifying access:', error);
//         navigate('/login');
//       }
//     };

//     verifyAccess();
//   }, [isLoaded, userId, navigate, getToken, allowedRoles]);

//   return isLoaded ? children : <div>Loading...</div>;
// }