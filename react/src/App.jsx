import React, { useEffect } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import './App.css';

import { Home } from './components/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Profile from './components/Profile/Profile.jsx';
import AdDetail from './components/Ads/AdDetail';
import AdForm from './components/Ads/AdForm';
import MyAds from './components/Ads/MyAds';
import ProtectedRoute from './components/common/ProtectedRoute';
import { logout } from './api/auth.jsx';

function App() {
  const routesList = [
    '/',
    '/login',
    '/register',
    '/profile',
    '/ads/create',
    '/ads/:id',
    '/ads/:id/edit',
    '/my-ads',
  ];

  // Report available routes to host environment
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.handleRoutes === 'function') {
      window.handleRoutes(routesList);
    }
  }, []);

  const isAuthed = typeof window !== 'undefined' ? !!localStorage.getItem('accessToken') : false;

  const onLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <ErrorBoundary>
      <div data-easytag="id1-src/App.jsx">
        <header data-easytag="id1-header-src/App.jsx" style={{ position: 'sticky', top: 0, background: '#ffffff', borderBottom: '1px solid #eee', zIndex: 1 }}>
          <div style={{ maxWidth: 1120, margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <NavLink to="/" style={{ fontWeight: 700, fontSize: 18, textDecoration: 'none', color: '#111' }}>Доска объявлений</NavLink>
            <nav style={{ display: 'flex', gap: 12 }}>
              <NavLink to="/" style={{ textDecoration: 'none' }}>Главная</NavLink>
              <NavLink to="/ads/create" style={{ textDecoration: 'none' }}>Создать объявление</NavLink>
              {isAuthed ? (
                <>
                  <NavLink to="/my-ads" style={{ textDecoration: 'none' }}>Мои объявления</NavLink>
                  <NavLink to="/profile" style={{ textDecoration: 'none' }}>Профиль</NavLink>
                  <button onClick={onLogout} style={{ marginLeft: 8, padding: '6px 10px' }}>Выйти</button>
                </>
              ) : (
                <>
                  <NavLink to="/login" style={{ textDecoration: 'none' }}>Войти</NavLink>
                  <NavLink to="/register" style={{ textDecoration: 'none' }}>Регистрация</NavLink>
                </>
              )}
            </nav>
          </div>
        </header>
        <main style={{ maxWidth: 1120, margin: '0 auto', padding: '16px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/ads/create" element={<ProtectedRoute><AdForm mode="create" /></ProtectedRoute>} />
            <Route path="/ads/:id" element={<AdDetail />} />
            <Route path="/ads/:id/edit" element={<ProtectedRoute><AdForm mode="edit" /></ProtectedRoute>} />
            <Route path="/my-ads" element={<ProtectedRoute><MyAds /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
