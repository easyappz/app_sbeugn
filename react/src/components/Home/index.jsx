import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { listCategories } from '../../api/categories.jsx';
import { listAds } from '../../api/ads.jsx';

export const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [priceMin, setPriceMin] = useState(searchParams.get('min_price') || '');
  const [priceMax, setPriceMax] = useState(searchParams.get('max_price') || '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('date_from') ? (searchParams.get('date_from') || '').slice(0, 10) : '');
  const [dateTo, setDateTo] = useState(searchParams.get('date_to') ? (searchParams.get('date_to') || '').slice(0, 10) : '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [ordering, setOrdering] = useState(searchParams.get('ordering') || '-created_at');

  // Data state
  const [cats, setCats] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load categories once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await listCategories();
        if (mounted) setCats(Array.isArray(data) ? data : []);
      } catch (e) {
        // Silent fail for categories, show empty select
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Build params for API
  const queryParams = useMemo(() => {
    const params = {};
    if (category) params.category = String(category);
    if (priceMin !== '') params.min_price = Number(priceMin);
    if (priceMax !== '') params.max_price = Number(priceMax);
    if (dateFrom) params.date_from = `${dateFrom}T00:00:00`;
    if (dateTo) params.date_to = `${dateTo}T23:59:59`;
    if (search) params.search = search;
    if (ordering) params.ordering = ordering;
    return params;
  }, [category, priceMin, priceMax, dateFrom, dateTo, search, ordering]);

  // Sync URL params for shareable filters
  useEffect(() => {
    const sp = new URLSearchParams();
    Object.keys(queryParams).forEach((k) => {
      const v = queryParams[k];
      if (v !== undefined && v !== null && String(v) !== '') sp.set(k, String(v));
    });
    setSearchParams(sp, { replace: true });
  }, [queryParams, setSearchParams]);

  // Load ads when filters change
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    (async () => {
      try {
        const data = await listAds(queryParams);
        if (!mounted) return;
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        const msg = err?.response?.data?.detail || 'Ошибка загрузки объявлений';
        setError(typeof msg === 'string' ? msg : 'Ошибка загрузки объявлений');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [queryParams]);

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleString();
    } catch (e) {
      return iso || '';
    }
  };

  const shortText = (text) => {
    if (!text) return '';
    if (text.length <= 160) return text;
    return text.slice(0, 160) + '…';
  };

  return (
    <div data-easytag="id2-src/components/Home/index.jsx" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
      <aside style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, alignSelf: 'start', position: 'sticky', top: 16 }}>
        <h3 style={{ marginTop: 0 }}>Фильтры</h3>

        <div style={{ display: 'grid', gap: 10 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4 }}>Категория</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: 8 }}>
              <option value="">Все категории</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>Цена от</label>
              <input type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="0" style={{ width: '100%', padding: 8 }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>Цена до</label>
              <input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="100000" style={{ width: '100%', padding: 8 }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>Дата с</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ width: '100%', padding: 8 }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>Дата по</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ width: '100%', padding: 8 }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 4 }}>Поиск</label>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ключевые слова" style={{ width: '100%', padding: 8 }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 4 }}>Сортировка</label>
            <select value={ordering} onChange={(e) => setOrdering(e.target.value)} style={{ width: '100%', padding: 8 }}>
              <option value="-created_at">Сначала новые</option>
              <option value="created_at">Сначала старые</option>
              <option value="price">Дешевле</option>
              <option value="-price">Дороже</option>
            </select>
          </div>
        </div>
      </aside>

      <section>
        <div style={{ marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>Объявления</h2>
          {loading ? <div style={{ color: '#666', marginTop: 6 }}>Загрузка...</div> : null}
          {error ? <div style={{ color: 'red', marginTop: 6 }}>{error}</div> : null}
        </div>

        {items.length === 0 && !loading ? (
          <div style={{ color: '#666' }}>Ничего не найдено</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {items.map((ad) => (
              <div key={ad.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>
                  <Link to={`/ads/${ad.id}`} style={{ color: '#111', textDecoration: 'none' }}>{ad.title}</Link>
                </div>
                <div style={{ color: '#0b6', fontWeight: 600 }}>{ad.price}</div>
                <div style={{ color: '#666', fontSize: 13 }}>{ad.category_name} · {formatDate(ad.created_at)}</div>
                <div style={{ color: '#333', whiteSpace: 'pre-wrap' }}>{shortText(ad.description)}</div>
                <div style={{ marginTop: 'auto' }}>
                  <Link to={`/ads/${ad.id}`}>Подробнее</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
