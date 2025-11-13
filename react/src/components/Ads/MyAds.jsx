import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listMyAds, deleteAd } from '../../api/ads.jsx';

export default function MyAds() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listMyAds();
      setItems(data || []);
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Ошибка загрузки объявлений';
      setError(typeof msg === 'string' ? msg : 'Ошибка загрузки объявлений');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      await load();
    })();
    return () => { mounted = false; };
  }, []);

  const onDelete = async (id) => {
    const ok = window.confirm('Удалить объявление?');
    if (!ok) return;
    try {
      await deleteAd(id);
      await load();
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Не удалось удалить';
      setError(typeof msg === 'string' ? msg : 'Не удалось удалить');
    }
  };

  const formatDate = (iso) => {
    try { return new Date(iso).toLocaleString(); } catch (e) { return iso || ''; }
  };

  if (error) {
    return <div data-easytag="id7-src/components/Ads/MyAds.jsx" style={{ maxWidth: 960, margin: '24px auto' }}>{error}</div>;
  }

  return (
    <div data-easytag="id7-src/components/Ads/MyAds.jsx" style={{ maxWidth: 960, margin: '24px auto', padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Мои объявления</h2>
      {loading ? <div>Загрузка...</div> : null}
      {(!loading && items.length === 0) ? (
        <div>Пока нет объявлений.</div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {items.map((ad) => (
            <div key={ad.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <div style={{ fontWeight: 600 }}>
                  <Link to={`/ads/${ad.id}`} style={{ textDecoration: 'none', color: '#111' }}>{ad.title}</Link>
                </div>
                <div style={{ color: '#0b6', fontWeight: 600 }}>{ad.price}</div>
              </div>
              <div style={{ color: '#666', fontSize: 13, marginTop: 4 }}>
                Создано: {formatDate(ad.created_at)} · Статус: {ad.is_active ? 'Активно' : 'Неактивно'}
              </div>
              <div style={{ marginTop: 8, display: 'flex', gap: 12 }}>
                <Link to={`/ads/${ad.id}`}>Открыть</Link>
                <Link to={`/ads/${ad.id}/edit`}>Редактировать</Link>
                <button onClick={() => onDelete(ad.id)} style={{ padding: '6px 10px' }}>Удалить</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
