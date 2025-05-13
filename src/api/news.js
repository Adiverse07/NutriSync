// src/api/news.js
import axios from 'axios';

const NEWS_API_KEY = '72c706eeae214362aeec033f0b9895fc';  // ← your key

/**
 * Fetch top health headlines (default country = us)
 * — now pulls 3 pages of 20 articles each → up to 60 total
 */
export async function fetchHealthNews() {
  const url = 'https://newsapi.org/v2/top-headlines';
  const paramsBase = {
    category: 'health',
    country: 'us',
    pageSize: 20,    // 20 per page
    apiKey: NEWS_API_KEY,
  };

  // pull pages 1, 2, and 3
  const allArticles = [];
  for (let page = 1; page <= 3; page++) {
    const resp = await axios.get(url, {
      params: { ...paramsBase, page },
    });
    if (resp.data.articles?.length) {
      allArticles.push(...resp.data.articles);
    }
  }

  return allArticles;  // array of { title, url, urlToImage, … }
}
