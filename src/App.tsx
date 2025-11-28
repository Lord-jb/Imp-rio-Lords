import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Overview } from './pages/admin/Overview';
import { Usuarios } from './pages/admin/Usuarios';
import { Campanhas } from './pages/admin/Campanhas';
import { AgendaPage } from './pages/admin/AgendaPage';
import { Solicitacoes } from './pages/admin/Solicitacoes';
import { LeadsPage } from './pages/admin/LeadsPage';
import { Arquivos } from './pages/admin/Arquivos';
import { InsightsPage } from './pages/admin/InsightsPage';
import { IdeiasPage } from './pages/admin/IdeiasPage';
import { Financeiro } from './pages/admin/Financeiro';
import { Integracoes } from './pages/admin/Integracoes';
import { ClientDashboard } from './pages/client/ClientDashboard';
import { AuthCallback } from './pages/AuthCallback';
import PrivateRoute from './routes/PrivateRoute';
import RoleRoute from './routes/RoleRoute';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';

function App() {
  return (
    <BrowserRouter>
      <PWAInstallPrompt />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route element={<PrivateRoute />}>
          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <RoleRoute role="admin">
                <Overview />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/usuarios"
            element={
              <RoleRoute role="admin">
                <Usuarios />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/campanhas"
            element={
              <RoleRoute role="admin">
                <Campanhas />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/agenda"
            element={
              <RoleRoute role="admin">
                <AgendaPage />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/solicitacoes"
            element={
              <RoleRoute role="admin">
                <Solicitacoes />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/leads"
            element={
              <RoleRoute role="admin">
                <LeadsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/arquivos"
            element={
              <RoleRoute role="admin">
                <Arquivos />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/insights"
            element={
              <RoleRoute role="admin">
                <InsightsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/ideias"
            element={
              <RoleRoute role="admin">
                <IdeiasPage />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/financeiro"
            element={
              <RoleRoute role="admin">
                <Financeiro />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/integracoes"
            element={
              <RoleRoute role="admin">
                <Integracoes />
              </RoleRoute>
            }
          />

          {/* Client Route */}
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