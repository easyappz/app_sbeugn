import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getAd, deleteAd } from '../../api/ads.jsx';
import { getMe } from '../../api/profile.jsx';

export default function AdDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ad, setAd] = useState(null);
  const [me, setMe] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');

    (async () => {
      try {
        const [adData, meData] = await Promise.all([
          getAd(id),
          (async () => {
            try { return await getMe(); } catch (e) { return null; }
          })()
        ]);
        if (!mounted) return;
        setAd(adData);
        setMe(meData);
      } catch (err) {
        const msg = err?.response?.data?.detail || 'Ошибка загрузки объявления';
        setError(typeof msg === 'string' ? msg : 'Ошибка загрузки объявления');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [id]);

  const isOwner = useMemo(() => {
    if (!ad || !me) return false;
    return Number(ad?.author?.id) === Number(me?.id);
  }, [ad, me]);

  const onDelete = async () => {
    if (!ad) return;
    const ok = window.confirm('Удалить объявление?');
    if (!ok) return;
    setDeleting(true);
    try {
      await deleteAd(ad.id);
      navigate('/');
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Не удалось удалить объявление';
      setError(typeof msg === 'string' ? msg : 'Не удалось удалить объявление');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (iso) => {
    try { return new Date(iso).toLocaleString(); } catch (e) { return iso || ''; }
  };

  if (error) {
    return <div data-easytag="id5-src/components/Ads/AdDetail.jsx" style={{ maxWidth: 960, margin: '24px auto' }}>{error}</div>;
  }
  if (loading || !ad) {
    return <div data-easytag="id5-src/components/Ads/AdDetail.jsx" style={{ maxWidth: 960, margin: '24px auto' }}>Загрузка...</div>;
  }

  return (
    <div data-easytag="id5-src/components/Ads/AdDetail.jsx" style={{ maxWidth: 960, margin: '24px auto', padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>{ad.title}</h2>
        {isOwner ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to={`/ads/${ad.id}/edit`} style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, textDecoration: 'none' }}>Редактировать</Link>
            <button onClick={onDelete} disabled={deleting} style={{ padding: '8px 12px' }}>{deleting ? 'Удаление...' : 'Удалить'}</button>
          </div>
        ) : null}
      </div>

      <div style={{ color: '#666', marginBottom: 8 }}>Категория: {ad.category_name} · Цена: {ad.price}</div>
      <div style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>Создано: {formatDate(ad.created_at)} · Обновлено: {formatDate(ad.updated_at)}</div>

      <div style={{ whiteSpace: 'pre-wrap', marginBottom: 12 }}>{ad.description}</div>

      <div style={{ padding: 12, background: '#fafafa', border: '1px solid #eee', borderRadius: 6, marginBottom: 16 }}>
        <div style={{ marginBottom: 4 }}><strong>Контакты:</strong> {ad.contact_info}</div>
      </div>

      <div style={{ padding: 12, background: '#f6fbff', border: '1px solid #dceefe', borderRadius: 6 }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Автор</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
          <div><strong>Имя пользователя:</strong> {ad.author?.username}</div>
          <div><strong>Email:</strong> {ad.author?.email}</div>
          <div><strong>Телефон:</strong> {ad.author?.phone || '—'}</div>
          <div><strong>О себе:</strong> {ad.author?.about || '—'}</div>
          <div><strong>Дата регистрации:</strong> {ad.author?.joined_at ? formatDate(ad.author.joined_at) : '—'}</div>
        </div>
      </div>
    </div>
  );
}
