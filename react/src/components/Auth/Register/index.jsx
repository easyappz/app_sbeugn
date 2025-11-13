import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../../api/auth.jsx';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', phone: '', about: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/login', { replace: true });
    } catch (err) {
      const data = err?.response?.data;
      const msg = typeof data === 'string' ? data : (data?.detail || 'Ошибка регистрации');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-easytag="id3-src/components/Auth/Register/index.jsx" style={{ maxWidth: 560, margin: '24px auto', padding: 16, border: '1px solid #e5e5e5', borderRadius: 8 }}>
      <h2 style={{ marginTop: 0 }}>Регистрация</h2>
      <form onSubmit={onSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label htmlFor="username">Имя пользователя</label>
            <input id="username" name="username" type="text" value={form.username} onChange={onChange} required style={{ width: '100%', padding: 8 }} />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={onChange} required style={{ width: '100%', padding: 8 }} />
          </div>
          <div>
            <label htmlFor="phone">Телефон</label>
            <input id="phone" name="phone" type="text" value={form.phone} onChange={onChange} style={{ width: '100%', padding: 8 }} />
          </div>
          <div>
            <label htmlFor="password">Пароль</label>
            <input id="password" name="password" type="password" value={form.password} onChange={onChange} required style={{ width: '100%', padding: 8 }} />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <label htmlFor="about">О себе</label>
          <textarea id="about" name="about" value={form.about} onChange={onChange} rows={4} style={{ width: '100%', padding: 8 }} />
        </div>
        {error ? <div style={{ color: 'red', marginTop: 12 }}>{error}</div> : null}
        <button type="submit" disabled={loading} style={{ marginTop: 12, padding: '10px 16px' }}>{loading ? 'Отправка...' : 'Зарегистрироваться'}</button>
      </form>
      <div style={{ marginTop: 12, fontSize: 14 }}>Уже есть аккаунт? <Link to="/login">Войти</Link></div>
    </div>
  );
}
