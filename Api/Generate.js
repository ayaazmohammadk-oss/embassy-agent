export default async function handler(req, res) {
if (req.method !== ‘POST’) {
return res.status(405).json({ error: ‘Method not allowed’ });
}

const { prompt } = req.body;
if (!prompt) return res.status(400).json({ error: ‘No prompt provided’ });

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) return res.status(500).json({ error: ‘API key not configured on server’ });

// Enable web search for news/briefing requests
const isNewsRequest = prompt.includes(‘Daily Intelligence’) || prompt.includes(‘briefing’) || prompt.includes(‘Search the web’);

const body = {
model: ‘claude-sonnet-4-20250514’,
max_tokens: isNewsRequest ? 4000 : 1500,
messages: [{ role: ‘user’, content: prompt }]
};

if (isNewsRequest) {
body.tools = [{ type: ‘web_search_20250305’, name: ‘web_search’ }];
}

try {
const response = await fetch(‘https://api.anthropic.com/v1/messages’, {
method: ‘POST’,
headers: {
‘Content-Type’: ‘application/json’,
‘x-api-key’: apiKey,
‘anthropic-version’: ‘2023-06-01’,
‘anthropic-beta’: ‘web-search-2025-03-05’
},
body: JSON.stringify(body)
});

```
const data = await response.json();
if (data.error) throw new Error(data.error.message);

// Extract all text blocks (after web search, Claude returns multiple blocks)
const text = data.content
  .filter(block => block.type === 'text')
  .map(block => block.text)
  .join('');

return res.status(200).json({ result: text });
```

} catch (err) {
return res.status(500).json({ error: err.message });
}
}
