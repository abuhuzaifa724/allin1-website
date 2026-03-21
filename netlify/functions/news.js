exports.handler = async (event) => {
  const { category = 'general', q = '' } = event.queryStringParameters || {};

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const NEWSDATA_KEY = 'pub_2546e64b425d418eaf206537d2ca7f77';

  const catMap = {
    general: 'top',
    business: 'business',
    technology: 'technology',
    sports: 'sports',
    entertainment: 'entertainment',
    science: 'science',
    health: 'health',
    world: 'world'
  };

  const cat = catMap[category] || 'top';

  try {
    const ndUrl = q
      ? `https://newsdata.io/api/1/news?apikey=${NEWSDATA_KEY}&language=en&q=${encodeURIComponent(q)}&size=12`
      : `https://newsdata.io/api/1/news?apikey=${NEWSDATA_KEY}&language=en&category=${cat}&size=12`;

    const ndRes = await fetch(ndUrl);
    const ndData = await ndRes.json();

    console.log('NewsData response status:', ndData.status);
    console.log('NewsData results count:', ndData.results?.length);

    if (ndData.status === 'success' && ndData.results && ndData.results.length > 0) {
      const articles = ndData.results
        .filter(a => a.title)
        .map(a => ({
          title: a.title,
          description: a.description || '',
          url: a.link || '#',
          urlToImage: a.image_url || null,
          publishedAt: a.pubDate || new Date().toISOString(),
          source: { name: a.source_id || 'NewsData' }
        }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ articles, source: 'newsdata' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        articles: [], 
        source: 'none',
        debug: ndData.message || 'No results found'
      })
    };

  } catch (e) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: e.message, 
        articles: [],
        source: 'error'
      })
    };
  }
};
```

---

**Commit changes** করো — তারপর আবার এই URL চেক করো 👇
```
allin1news.netlify.app/.netlify/functions/news?category=general
