import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { useAuthStore } from './store/useAuthStore';
import { CardSystem } from './components/CardSystem';
import { AuthenticatedLayout } from './components/AuthenticatedLayout';
import './styles/main.scss';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? (
    <AuthenticatedLayout>{children}</AuthenticatedLayout>
  ) : (
    <Navigate to="/login" />
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <CardSystem />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
