// frontend/netlify/functions/news.js

export const handler = async (event) => {
  const { country, category, page, pageSize, q, sortBy, dateRange } = event.queryStringParameters;
  const API_KEY = process.env.VITE_NEWS_API_KEY;
  const API_BASE = 'https://newsapi.org/v2';

  let url;
  if (q) {
    const params = new URLSearchParams({
      q,
      language: 'en',
      sortBy: sortBy || 'publishedAt',
      page: page || '1',
      pageSize: pageSize || '18',
    });
    if (dateRange) {
       // Logic for handling dateRange would go here
    }
    url = `${API_BASE}/everything?${params.toString()}`;
  } else {
    const params = new URLSearchParams({
      country: country || 'in',
      category: category || 'general',
      page: page || '1',
      pageSize: pageSize || '18',
    });
    url = `${API_BASE}/top-headlines?${params.toString()}`;
  }


  try {
    const response = await fetch(url, {
      headers: {
        'X-Api-Key': API_KEY,
      },
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Failed to fetch news' }),
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};