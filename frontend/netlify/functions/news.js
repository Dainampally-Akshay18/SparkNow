// netlify/functions/news.js
export const handler = async (event) => {
  // Safe default to avoid destructuring undefined
  const qs = event?.queryStringParameters || {};
  const { country, category, page, pageSize, q, sortBy, from, language } = qs;

  const API_KEY = process.env.VITE_NEWS_API_KEY;
  const API_BASE = "https://newsapi.org/v2";

  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        status: "error",
        code: "apiKeyMissing",
        message: "The VITE_NEWS_API_KEY is not configured in the Netlify environment.",
      }),
    };
  }

  const params = new URLSearchParams();
  let endpoint = "top-headlines";

  // Search mode
  if (q && q.trim()) {
    endpoint = "everything";
    params.set("q", q.trim());
    params.set("sortBy", sortBy || "publishedAt");
    if (from) params.set("from", from);
    if (language) params.set("language", language); // supported on everything
  } else {
    // Headlines mode
    params.set("country", country || "in");
    params.set("category", category || "general");
    // do NOT set language here (ignored by NewsAPI)
  }

  // Pagination
  params.set("page", page || "1");
  params.set("pageSize", pageSize || "18");

  const url = `${API_BASE}/${endpoint}?${params.toString()}`;
  console.log("[fn:news]", url);

  try {
    const response = await fetch(url, { headers: { "X-Api-Key": API_KEY } });
    const contentType = response.headers.get("content-type") || "";
    let data;

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      // Make sure we still return JSON to the client even if upstream didn’t
      const text = await response.text();
      console.error("[fn:news] Non-JSON upstream:", text.slice(0, 200));
      return {
        statusCode: 502,
        body: JSON.stringify({ status: "error", message: "Upstream returned non-JSON." }),
      };
    }

    if (response.status !== 200) {
      console.error("[fn:news] upstream error:", data);
      return { statusCode: response.status, body: JSON.stringify(data) };
    }

    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (error) {
    console.error("[fn:news] error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        status: "error",
        message: "An internal error occurred while trying to contact the News API.",
      }),
    };
  }
};
