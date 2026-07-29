import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { AppLayout } from './layouts/AppLayout.jsx';
import { AssetDetails } from './pages/AssetDetails.jsx';
import { AssetForm } from './pages/AssetForm.jsx';
import { Assets } from './pages/Assets.jsx';
import { Assignments } from './pages/Assignments.jsx';
import { Categories } from './pages/Categories.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Login } from './pages/Login.jsx';
import { Maintenance } from './pages/Maintenance.jsx';
import { NotFound } from './pages/NotFound.jsx';
import { Profile } from './pages/Profile.jsx';
import { Register } from './pages/Register.jsx';
import { Reports } from './pages/Reports.jsx';
import { Returns } from './pages/Returns.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { UsersPage } from './pages/UsersPage.jsx';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/assets/new" element={<AssetForm />} />
          <Route path="/assets/:id" element={<AssetDetails />} />
          <Route path="/assets/:id/edit" element={<AssetForm />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
