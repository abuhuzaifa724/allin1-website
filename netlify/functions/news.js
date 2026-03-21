const NEWSDATA_KEY = 'pub_2546e64b425d418eaf206537d2ca7f77';
const GNEWS_KEY = '0400a760de583de07200841de459ba7c';

exports.handler = async (event) => {
  const { category = 'general', q = '' } = event.queryStringParameters || {};

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    let articles = [];

    // Try NewsData.io first
    const catMap = { general:'top', business:'business', technology:'technology', sports:'sports', entertainment:'entertainment', science:'science', health:'health', world:'world' };
    const cat = catMap[category] || 'top';

    const ndUrl = q
      ? `https://newsdata.io/api/1/news?apikey=${NEWSDATA_KEY}&language=en&q=${encodeURIComponent(q)}&size=12`
      : `https://newsdata.io/api/1/news?apikey=${NEWSDATA_KEY}&language=en&category=${cat}&size=12`;

    const ndRes = await fetch(ndUrl);
    const ndData = await ndRes.json();

    if (ndData.status === 'success' && ndData.results?.length) {
      articles = ndData.results.filter(a => a.title).map(a => ({
        title: a.title,
        description: a.description,
        url: a.link,
        urlToImage: a.image_url,
        publishedAt: a.pubDate,
        source: { name: a.source_id || 'NewsData' }
      }));
      return { statusCode: 200, headers, body: JSON.stringify({ articles, source: 'newsdata' }) };
    }

    // Fallback to GNews
    const gnCat = category === 'world' ? 'general' : category;
    const gnUrl = q
      ? `https://gnews.io/api/v4/search?q=${encodeURIComponent(q)}&lang=en&max=12&apikey=${GNEWS_KEY}`
      : `https://gnews.io/api/v4/top-headlines?category=${gnCat}&lang=en&max=12&apikey=${GNEWS_KEY}`;

    const gnRes = await fetch(gnUrl);
    const gnData = await gnRes.json();

    if (gnData.articles?.length) {
      articles = gnData.articles.map(a => ({
        title: a.title,
        description: a.description,
        url: a.url,
        urlToImage: a.image,
        publishedAt: a.publishedAt,
        source: { name: a.source?.name || 'GNews' }
      }));
      return { statusCode: 200, headers, body: JSON.stringify({ articles, source: 'gnews' }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ articles: [], source: 'none' }) };

  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message, articles: [] }) };
  }
};
