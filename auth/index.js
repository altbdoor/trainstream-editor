const corsHeaders = {
    'Access-Control-Allow-Origin': `${CORS_URL}`,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
};

addEventListener('fetch', (event) => {
    if (event.request.method === 'OPTIONS') {
        return new Response(null, {
            headers: { ...corsHeaders },
        });
    }

    event.respondWith(handleRequest(event.request));
});

/**
 * Respond to the request
 * @param {Request} req
 */
async function handleRequest(req) {
    const params = new URL(req.url).searchParams;

    if (!params.has('code') || !params.has('client_id')) {
        return new Response('error: no code parameter', {
            status: 500,
            headers: { ...corsHeaders },
        });
    }

    const oauthData = new FormData();
    oauthData.append('code', params.get('code'));
    oauthData.append('client_id', params.get('client_id'));
    oauthData.append('client_secret', GITHUB_CLIENT_SECRET);

    try {
        const tokenData = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            body: oauthData,
            headers: { Accept: 'application/json' },
        }).then((data) => data.text());

        return new Response(tokenData, {
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                ...corsHeaders,
            },
        });
    } catch (err) {
        console.error(err);

        return new Response('error: unable to auth', {
            status: 500,
            headers: { ...corsHeaders },
        });
    }
}
