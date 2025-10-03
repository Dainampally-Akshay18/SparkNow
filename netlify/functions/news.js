// frontend/netlify/functions/news.js

export const handler = async (event) => {
  // Get the query parameters from the request made by your React app
  const { country, category, page, pageSize, q, sortBy } = event.queryStringParameters;
  
  // Access the API key securely from Netlify's environment variables
  const API_KEY = process.env.VITE_NEWS_API_KEY;
  const API_BASE = 'https://newsapi.org/v2';

  // If the API key is not set, return an error immediately
  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key is not configured.' }),
    };
  }

  // Build the correct URL based on whether there's a search query 'q'
  const params = new URLSearchParams();
  let endpoint = 'top-headlines';

  if (q && q.trim()) {
    endpoint = 'everything';
    params.set('q', q.trim());
    params.set('sortBy', sortBy || 'publishedAt');
  } else {
    params.set('country', country || 'in');
    params.set('category', category || 'general');
  }
  
  params.set('page', page || '1');
  params.set('pageSize', pageSize || '18');

  const url = `${API_BASE}/${endpoint}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        'X-Api-Key': API_KEY,
      },
    });

    const data = await response.json();

    // Pass the response from the News API back to your frontend
    return {
      statusCode: response.status,
      body: JSON.stringify(data),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An internal error occurred.' }),
    };
  }
};