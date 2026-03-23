const https = require('https');

exports.handler = function(event, context, callback) {
  var headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  var options = {
    hostname: 'newsdata.io',
    path: '/api/1/news?apikey=pub_2546e64b425d418eaf206537d2ca7f77&language=en&category=top&size=5',
    method: 'GET'
  };

  var req = https.request(options, function(res) {
    var body = '';
    res.on('data', function(chunk) { body += chunk; });
    res.on('end', function() {
      callback(null, {
        statusCode: 200,
        headers: headers,
        body: body
      });
    });
  });

  req.on('error', function(e) {
    callback(null, {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({ error: e.message })
    });
  });

  req.end();
};
```

**Commit** করো — তারপর এই URL চেক করো 👇
```
allin1news.netlify.app/.netlify/functions/news
