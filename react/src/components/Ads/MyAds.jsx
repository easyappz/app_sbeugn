import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listMyAds } from '../../api/ads.jsx';

export default function MyAds() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await listMyAds();
        if (mounted) setItems(data || []);
      } catch (err) {
        const msg = err?.response?.data?.detail || 'Ошибка загрузки объявлений';
        setError(typeof msg === 'string' ? msg : 'Ошибка загрузки объявлений');
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (error) {
    return <div data-easytag="id7-src/components/Ads/MyAds.jsx" style={{ maxWidth: 960, margin: '24px auto' }}>{error}</div>;
  }

  return (
    <div data-easytag="id7-src/components/Ads/MyAds.jsx" style={{ maxWidth: 960, margin: '24px auto', padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Мои объявления</h2>
      {items.length === 0 ? (
        <div>Пока нет объявлений.</div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {items.map((ad) => (
            <div key={ad.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
              <div style={{ fontWeight: 600 }}><Link to={`/ads/${ad.id}`}>{ad.title}</Link></div>
              <div style={{ color: '#666' }}>Цена: {ad.price} · Категория: {ad.category_name}</div>
              <div style={{ marginTop: 8 }}><Link to={`/ads/${ad.id}/edit`}>Редактировать</Link></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
