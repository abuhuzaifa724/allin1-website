exports.handler = async function(event) {
  var category = 'general';
  var q = '';
  
  if (event.queryStringParameters) {
    if (event.queryStringParameters.category) {
      category = event.queryStringParameters.category;
    }
    if (event.queryStringParameters.q) {
      q = event.queryStringParameters.q;
    }
  }

  var headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: headers, body: '' };
  }

  var NEWSDATA_KEY = 'pub_2546e64b425d418eaf206537d2ca7f77';

  var catMap = {
    general: 'top',
    business: 'business',
    technology: 'technology',
    sports: 'sports',
    entertainment: 'entertainment',
    science: 'science',
    health: 'health',
    world: 'world'
  };

  var cat = catMap[category] || 'top';

  try {
    var ndUrl = '';
    if (q) {
      ndUrl = 'https://newsdata.io/api/1/news?apikey=' + NEWSDATA_KEY + '&language=en&q=' + encodeURIComponent(q) + '&size=12';
    } else {
      ndUrl = 'https://newsdata.io/api/1/news?apikey=' + NEWSDATA_KEY + '&language=en&category=' + cat + '&size=12';
    }

    var ndRes = await fetch(ndUrl);
    var ndData = await ndRes.json();

    if (ndData.status === 'success' && ndData.results && ndData.results.length > 0) {
      var articles = [];
      for (var i = 0; i < ndData.results.length; i++) {
        var a = ndData.results[i];
        if (!a.title) continue;
        var sourceName = 'NewsData';
        if (a.source_id) sourceName = a.source_id;
        articles.push({
          title: a.title,
          description: a.description || '',
          url: a.link || '#',
          urlToImage: a.image_url || null,
          publishedAt: a.pubDate || new Date().toISOString(),
          source: { name: sourceName }
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
      body: JSON.stringify({ articles: [], source: 'none' })
    };

  } catch (e) {
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({ error: e.message, articles: [], source: 'error' })
    };
  }
};
