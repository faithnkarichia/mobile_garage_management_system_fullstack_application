// src/components/ProtectedRoute.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      console.log('-e-e-e--e-fr-r-r-r-', decoded)
      if (!allowedRoles.includes(decoded.sub.role)) {
        navigate('/unauthorized');
      }
    } catch (error) {
      localStorage.removeItem('access_token');
      navigate('/login');
    }
  }, [token, navigate, allowedRoles]);

  if (!token) return null;

  return children;
};

export default ProtectedRoute;