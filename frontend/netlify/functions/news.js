// frontend/netlify/functions/news.js

export const handler = async (event) => {
  // Get the query parameters sent from your React app
  const { country, category, page, pageSize, q, sortBy, from } = event.queryStringParameters;
  
  // Access your API key securely from Netlify's environment variables
  const API_KEY = process.env.VITE_NEWS_API_KEY;
  const API_BASE = 'https://newsapi.org/v2';

  // If the API key isn't set up in Netlify, return an error immediately
  if (!API_KEY) {
    console.error("API Key is missing.");
    return {
      statusCode: 500,
      body: JSON.stringify({
        status: "error",
        code: "apiKeyMissing",
        message: "The VITE_NEWS_API_KEY is not configured in the Netlify environment."
      }),
    };
  }

  // Prepare the parameters for the News API call
  const params = new URLSearchParams();
  let endpoint = 'top-headlines'; // Default to top-headlines

  // Check if the request is a search query (if 'q' exists)
  if (q && q.trim()) {
    endpoint = 'everything';
    params.set('q', q.trim());
    params.set('sortBy', sortBy || 'publishedAt');
    if (from) {
      params.set('from', from);
    }
  } else {
    // Otherwise, it's a request for top headlines by category
    params.set('country', country || 'in');
    params.set('category', category || 'general');
  }
  
  // Add pagination parameters for all requests
  params.set('page', page || '1');
  params.set('pageSize', pageSize || '18');

  const url = `${API_BASE}/${endpoint}?${params.toString()}`;
  console.log(url)

  try {
    const response = await fetch(url, {
      headers: {
        'X-Api-Key': API_KEY,
      },
    });

    const data = await response.json();
    
    // If the News API returns an error (like 'apiKeyInvalid'), pass it through
    if (response.status !== 200) {
        console.error("News API returned an error:", data);
    }

    // Send the data from the News API back to your React app
    return {
      statusCode: response.status,
      body: JSON.stringify(data),
    };

  } catch (error) {
    console.error("Error fetching from News API:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        status: "error",
        message: "An internal error occurred while trying to contact the News API."
      }),
    };
  }
};