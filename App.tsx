import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { BarberDetails } from './pages/BarberDetails';
import { Appointments } from './pages/Appointments';
import { AdminBarbers } from './pages/AdminBarbers';
import { AdminBarberForm } from './pages/AdminBarberForm';
import { AdminAppointments } from './pages/AdminAppointments';
import { AdminServices } from './pages/AdminServices';

const ProtectedRoute: React.FC<{ children: React.ReactNode, roles?: string[] }> = ({ children, roles }) => {
    const { user, isLoading } = useAuth();
    if (isLoading) return null;
    if (!user) return <Navigate to="/login" replace />;
    
    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }
    return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/barber/:id" element={<BarberDetails />} />
            <Route path="/appointments" element={<Appointments />} />
            
            {/* Admin Routes */}
            <Route path="/admin/barbers" element={<ProtectedRoute roles={['ADMIN']}><AdminBarbers /></ProtectedRoute>} />
            <Route path="/admin/barbers/new" element={<ProtectedRoute roles={['ADMIN']}><AdminBarberForm /></ProtectedRoute>} />
            <Route path="/admin/barbers/edit/:id" element={<ProtectedRoute roles={['ADMIN']}><AdminBarberForm /></ProtectedRoute>} />
            <Route path="/admin/services" element={<ProtectedRoute roles={['ADMIN']}><AdminServices /></ProtectedRoute>} />
            
            {/* Shared Admin/Barber Route */}
            <Route path="/admin/appointments" element={<ProtectedRoute roles={['ADMIN', 'BARBER']}><AdminAppointments /></ProtectedRoute>} />
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;