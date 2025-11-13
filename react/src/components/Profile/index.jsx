import React, { useEffect, useState } from 'react';
import { getMe, updateMe } from '../../api/profile.jsx';

export default function Profile() {
  const [me, setMe] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getMe();
        if (mounted) setMe(data);
      } catch (err) {
        const msg = err?.response?.data?.detail || 'Ошибка загрузки профиля';
        setError(typeof msg === 'string' ? msg : 'Ошибка загрузки профиля');
      }
    })();
    return () => { mounted = false; };
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setMe((prev) => ({ ...prev, [name]: value }));
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!me) return;
    setSaving(true);
    setError('');
    try {
      const updated = await updateMe({ email: me.email, phone: me.phone, about: me.about });
      setMe(updated);
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Ошибка сохранения';
      setError(typeof msg === 'string' ? msg : 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  if (!me) {
    return <div data-easytag="id4-src/components/Profile/index.jsx" style={{ maxWidth: 720, margin: '24px auto' }}>Загрузка...</div>;
  }

  return (
    <div data-easytag="id4-src/components/Profile/index.jsx" style={{ maxWidth: 720, margin: '24px auto', padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Профиль</h2>
      <div style={{ marginBottom: 16, color: '#666' }}>Дата регистрации: {new Date(me.joined_at).toLocaleString()}</div>
      <form onSubmit={onSave}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label>Имя пользователя</label>
            <input type="text" value={me.username} disabled style={{ width: '100%', padding: 8 }} />
          </div>
          <div>
            <label>Email</label>
            <input name="email" type="email" value={me.email || ''} onChange={onChange} style={{ width: '100%', padding: 8 }} />
          </div>
          <div>
            <label>Телефон</label>
            <input name="phone" type="text" value={me.phone || ''} onChange={onChange} style={{ width: '100%', padding: 8 }} />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <label>О себе</label>
          <textarea name="about" value={me.about || ''} onChange={onChange} rows={4} style={{ width: '100%', padding: 8 }} />
        </div>
        {error ? <div style={{ color: 'red', marginTop: 12 }}>{error}</div> : null}
        <button type="submit" disabled={saving} style={{ marginTop: 12, padding: '10px 16px' }}>{saving ? 'Сохранение...' : 'Сохранить'}</button>
      </form>
    </div>
  );
}
