const API_BASE = 'https://cobblemonextras.com';
const SERVER_ID = '6a16d56a9bd4b6296506e1d7';

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // CORS preflight (todas las rutas)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // ─── Ruta existente: players ──────────────────────────────────────
    if (url.pathname === '/api/players' && request.method === 'GET') {
      const apiUrl = `${API_BASE}/api/showcase/servers/${SERVER_ID}/players?page=1`;
      try {
        const apiResponse = await fetch(apiUrl, {
          headers: { 'Accept': 'application/json' },
        });
        const body = await apiResponse.text();
        return new Response(body, {
          status: apiResponse.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache',
          },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 502,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    // ─── Nueva ruta: proxy para Smogon Stats ─────────────────────────
    if (url.pathname === '/api/smogon-stats' && request.method === 'GET') {
      const target = url.searchParams.get('url');
      if (!target) {
        return new Response('Falta el parámetro "url"', {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
        });
      }

      // Solo permitir URLs de Smogon
      if (!target.startsWith('https://www.smogon.com/stats/')) {
        return new Response('URL no permitida', {
          status: 403,
          headers: { 'Access-Control-Allow-Origin': '*' },
        });
      }

      try {
        const apiResponse = await fetch(target);
        const body = await apiResponse.text();
        return new Response(body, {
          status: apiResponse.status,
          headers: {
            'Content-Type': apiResponse.headers.get('Content-Type') || 'application/octet-stream',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Expose-Headers': '*',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 502,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    return new Response('Proxy funcionando — usa /api/players o /api/smogon-stats', { status: 404 });
  },
};
