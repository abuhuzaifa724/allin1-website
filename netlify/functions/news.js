const https = require('https');

exports.handler = function(event, context, callback) {
  var headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  var category = 'top';
  if (event.queryStringParameters && event.queryStringParameters.category) {
    var catMap = {
      general: 'top', business: 'business', technology: 'technology',
      sports: 'sports', entertainment: 'entertainment',
      science: 'science', health: 'health', world: 'world'
    };
    category = catMap[event.queryStringParameters.category] || 'top';
  }

  var path = '/api/1/news?apikey=pub_2546e64b425d418eaf206537d2ca7f77&language=en&category=' + category + '&size=12';

  var options = {
    hostname: 'newsdata.io',
    path: path,
    method: 'GET'
  };

  var req = https.request(options, function(res) {
    var body = '';
    res.on('data', function(chunk) { body += chunk; });
    res.on('end', function() {
      try {
        var data = JSON.parse(body);
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
              source: { name: a.source_id || 'News' }
            });
          }
          callback(null, {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify({ articles: articles, source: 'newsdata' })
          });
        } else {
          callback(null, {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify({ articles: [], source: 'none', debug: data.message || '' })
          });
        }
      } catch(e) {
        callback(null, {
          statusCode: 500,
          headers: headers,
          body: JSON.stringify({ error: e.message, articles: [] })
        });
      }
    });
  });

  req.on('error', function(e) {
    callback(null, {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({ error: e.message, articles: [] })
    });
  });

  req.end();
};
