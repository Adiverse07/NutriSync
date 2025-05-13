// src/hooks/useHealthNews.js
import { useEffect, useState } from 'react';
import { fetchHealthNews } from '../api/news';

export default function useHealthNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHealthNews()
      .then(articles => { setNews(articles); })
      .catch(err => { 
        console.error('Error fetching health news', err);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, []);

  return { news, loading, error };
}
