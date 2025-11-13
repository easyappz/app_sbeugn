import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login } from '../../../api/auth.jsx';

export default function Login() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ username_or_email: usernameOrEmail, password });
      const to = location.state?.from?.pathname || '/profile';
      navigate(to, { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Ошибка авторизации';
      setError(typeof msg === 'string' ? msg : 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-easytag="id2-src/components/Auth/Login/index.jsx" style={{ maxWidth: 420, margin: '24px auto', padding: 16, border: '1px solid #e5e5e5', borderRadius: 8 }}>
      <h2 style={{ marginTop: 0 }}>Вход</h2>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="usernameOrEmail">Логин или Email</label>
          <input id="usernameOrEmail" type="text" value={usernameOrEmail} onChange={(e) => setUsernameOrEmail(e.target.value)} placeholder="username или email" style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} required />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="password">Пароль</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} required />
        </div>
        {error ? <div style={{ color: 'red', marginBottom: 12 }}>{error}</div> : null}
        <button type="submit" disabled={loading} style={{ padding: '10px 16px' }}>{loading ? 'Входим...' : 'Войти'}</button>
      </form>
      <div style={{ marginTop: 12, fontSize: 14 }}>
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </div>
    </div>
  );
}
