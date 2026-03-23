exports.handler = async function(event) {
  var headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    var url = 'https://newsdata.io/api/1/news?apikey=pub_2546e64b425d418eaf206537d2ca7f77&language=en&category=top&size=5';
    var res = await fetch(url);
    var data = await res.json();
    
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({
        status: data.status,
        count: data.results ? data.results.length : 0,
        message: data.message || 'no message',
        raw: data
      })
    };
  } catch(e) {
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({ error: e.message })
    };
  }
};
```

**Commit** করো — তারপর এই URL চেক করো 👇
```
allin1news.netlify.app/.netlify/functions/news
