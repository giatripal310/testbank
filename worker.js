// ─────────────────────────────────────────────────────────────
// Cloudflare Worker — AI proxy for School Test Bank
//
// Setup:
//  1. Go to https://workers.cloudflare.com → sign up free
//  2. Create a new Worker
//  3. Paste this entire file into the editor
//  4. Go to Settings → Variables → add secret:
//       Name:  ANTHROPIC_API_KEY
//       Value: sk-ant-... (your Anthropic key)
//  5. Deploy → copy the Worker URL (e.g. https://testbank-ai.your-name.workers.dev)
//  6. Paste that URL into config.js as AI_WORKER_URL
// ─────────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin':  '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    const body = await request.json()

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method:  'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-opus-4-8',
        max_tokens: 2048,
        system:     body.system,
        messages:   body.messages,
      }),
    })

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type':                'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  },
}
