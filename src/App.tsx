import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ClientDashboard } from './pages/client/ClientDashboard';
import { AuthCallback } from './pages/AuthCallback';
import PrivateRoute from './routes/PrivateRoute';
import RoleRoute from './routes/RoleRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route element={<PrivateRoute />}>
          <Route
            path="/admin"
            element={
              <RoleRoute role="admin">
                <AdminDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/client"
            element={
              <RoleRoute role="client">
                <ClientDashboard />
              </RoleRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;