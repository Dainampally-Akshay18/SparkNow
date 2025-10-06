// netlify/functions/news.js
export const handler = async (event) => {
  // Safe destructuring with default
  const qs = event?.queryStringParameters || {};
  const { country, category, page, pageSize, q, sortBy, from, language } = qs;

  // Read API key; prefer VITE_NEWS_API_KEY, fallback to legacy if present
  const API_KEY = process.env.VITE_NEWS_API_KEY || process.env.VITE_NEWSAPIKEY;
  const usedEnv = process.env.VITE_NEWS_API_KEY
    ? "VITE_NEWS_API_KEY"
    : process.env.VITE_NEWSAPIKEY
    ? "VITE_NEWSAPIKEY"
    : "NONE";
  console.info("[fn:news] qs:", qs);
  console.info("[fn:news] env key used:", usedEnv);

  if (!API_KEY) {
    console.error("[fn:news] Missing API key");
    return {
      statusCode: 500,
      body: JSON.stringify({
        status: "error",
        code: "apiKeyMissing",
        message:
          "The VITE_NEWS_API_KEY is not configured in the Netlify environment.",
      }),
    };
  }

  const API_BASE = "https://newsapi.org/v2";
  const params = new URLSearchParams();
  let endpoint = "top-headlines";

  if (q && q.trim()) {
    endpoint = "everything";
    params.set("q", q.trim());
    params.set("sortBy", sortBy || "publishedAt");
    if (from) params.set("from", from);
    if (language) params.set("language", language); // supported only on everything
  } else {
    params.set("country", country || "in");
    params.set("category", category || "general");
    // no language for top-headlines
  }

  params.set("page", page || "1");
  params.set("pageSize", pageSize || "18");

  const url = `${API_BASE}/${endpoint}?${params.toString()}`;
  console.info("[fn:news] endpoint:", endpoint);
  console.info("[fn:news] url:", url);

  try {
    const response = await fetch(url, { headers: { "X-Api-Key": API_KEY } });
    const contentType = response.headers.get("content-type") || "";
    let data = null;

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error("[fn:news] Non-JSON from upstream:", text.slice(0, 200));
      return {
        statusCode: 502,
        body: JSON.stringify({
          status: "error",
          message: "Upstream returned non-JSON.",
        }),
      };
    }

    console.info("[fn:news] status:", response.status);

    if (response.status !== 200) {
      console.error("[fn:news] upstream error payload:", data);
      return { statusCode: response.status, body: JSON.stringify(data) };
    }

    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (err) {
    console.error("[fn:news] fetch error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        status: "error",
        message:
          "An internal error occurred while trying to contact the News API.",
      }),
    };
  }
};
