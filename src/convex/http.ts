import { httpRouter } from 'convex/server';
import { auth } from './auth';
import { httpAction } from './_generated/server';
import { postMessageHandler } from './messages';

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
	path: '/postMessage',
	method: 'POST',
	handler: postMessageHandler
});

http.route({
	path: '/postMessage',
	method: 'OPTIONS',
	handler: httpAction(async (_, request) => {
		const headers = request.headers;
		if (
			headers.get('Origin') !== null &&
			headers.get('Access-Control-Request-Method') !== null &&
			headers.get('Access-Control-Request-Headers') !== null
		) {
			return new Response(null, {
				headers: new Headers({
					// e.g. https://mywebsite.com, configured on your Convex dashboard
					'Access-Control-Allow-Origin': process.env.SITE_URL!,
					'Access-Control-Allow-Methods': 'POST',
					'Access-Control-Allow-Headers': 'Content-Type, Digest',
					'Access-Control-Max-Age': '86400'
				})
			});
		} else {
			return new Response();
		}
	})
});

export default http;
