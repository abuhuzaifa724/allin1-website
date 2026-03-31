exports.handler = async function(event) {
  var headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: headers, body: '' };
  }

  var category = 'top';
  if (event.queryStringParameters && event.queryStringParameters.category) {
    var catMap = {
      general: 'top', business: 'business', technology: 'technology',
      sports: 'sports', entertainment: 'entertainment',
      science: 'science', health: 'health', world: 'world'
    };
    category = catMap[event.queryStringParameters.category] || 'top';
  }

  var q = '';
  if (event.queryStringParameters && event.queryStringParameters.q) {
    q = event.queryStringParameters.q;
  }

  var NEWSDATA_KEY = 'pub_2546e64b425d418eaf206537d2ca7f77';
  var url = q
    ? 'https://newsdata.io/api/1/news?apikey=' + NEWSDATA_KEY + '&language=en&q=' + encodeURIComponent(q) + '&size=12'
    : 'https://newsdata.io/api/1/news?apikey=' + NEWSDATA_KEY + '&language=en&category=' + category + '&size=12';

  try {
    var response = await fetch(url);
    var data = await response.json();

    if (data.status === 'success' && data.results && data.results.length > 0) {
      var articles = [];
      for (var i = 0; i < data.results.length; i++) {
        var a = data.results[i];
        if (!a.title) continue;
        articles.push({
          title: a.title,
          description: a.description || '',
          url: a.link || '#',
          urlToImage: a.image_url || null,
          publishedAt: a.pubDate || '',
          source: { name: a.source_id || 'NewsData' }
        });
      }
      return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify({ articles: articles, source: 'newsdata' })
      };
    }

  return {
  statusCode: 200,
  headers: headers,
  body: JSON.stringify({ articles: [], source: 'none', debug: data })
};
  } catch(e) {
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({ error: e.message, articles: [] })
    };
  }
};
