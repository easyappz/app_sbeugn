import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAd } from '../../api/ads.jsx';

export default function AdDetail() {
  const { id } = useParams();
  const [ad, setAd] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getAd(id);
        if (mounted) setAd(data);
      } catch (err) {
        const msg = err?.response?.data?.detail || 'Ошибка загрузки объявления';
        setError(typeof msg === 'string' ? msg : 'Ошибка загрузки объявления');
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  if (error) {
    return <div data-easytag="id5-src/components/Ads/AdDetail.jsx" style={{ maxWidth: 960, margin: '24px auto' }}>{error}</div>;
  }

  if (!ad) {
    return <div data-easytag="id5-src/components/Ads/AdDetail.jsx" style={{ maxWidth: 960, margin: '24px auto' }}>Загрузка...</div>;
  }

  return (
    <div data-easytag="id5-src/components/Ads/AdDetail.jsx" style={{ maxWidth: 960, margin: '24px auto', padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>{ad.title}</h2>
      <div style={{ color: '#666', marginBottom: 8 }}>Категория: {ad.category_name} · Цена: {ad.price}</div>
      <div style={{ whiteSpace: 'pre-wrap', marginBottom: 12 }}>{ad.description}</div>
      <div style={{ padding: 12, background: '#fafafa', border: '1px solid #eee', borderRadius: 6 }}>
        <div><strong>Контакты:</strong> {ad.contact_info}</div>
        <div style={{ marginTop: 4 }}><strong>Автор:</strong> {ad.author?.username} · {ad.author?.email}</div>
      </div>
    </div>
  );
}
