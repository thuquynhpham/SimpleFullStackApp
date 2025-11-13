import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import api, { setAuthToken } from './services/api';
import LoginPage from './pages/LoginPage';
import ProductsPage from './pages/ProductsPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const loadProfile = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setProfile(null);
      return;
    }

    setLoadingProfile(true);
    try {
      const { data } = await api.get('/Users/profile');
      setProfile(data);
    } catch (error) {
      console.error('Profile load error:', error);
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile, location.pathname]);

  const handleLogout = async () => {
    setAuthToken(null);
    setProfile(null);
    navigate('/login', { replace: true });
  };

  const isAuthenticated = Boolean(profile);

  return (
    <div className="app-shell">
      <header className="navbar">
        <div className="navbar__group navbar__group--left">
          <h1 className="navbar__brand">Products App</h1>
          <Link to="/products" className="btn">
            Products
          </Link>
        </div>
        <nav className="navbar__links">
          {loadingProfile && <span className="navbar__greeting text-muted">Loading…</span>}
          {!loadingProfile && profile && (
            <span className="navbar__greeting">
              Hello! {profile.name || profile.email}
              {profile.role ? ` (${profile.role})` : ''}
            </span>
          )}
          <Link to="/register" className="btn btn--primary">
            Register
          </Link>
          {!isAuthenticated ? (
            <Link to="/login" className="btn">
              Login
            </Link>
          ) : (
            <button type="button" className="btn" onClick={handleLogout}>
              Logout
            </button>
          )}
        </nav>
      </header>

      <main className="app-shell__content">
        <Routes>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/products" element={<ProductsPage onReloadProfile={loadProfile} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/products" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
