import { httpRouter } from 'convex/server';
import { auth } from './auth';
import { httpAction } from './_generated/server';
import { postMessageHandler } from './messages';
import { uploadAttachment } from './attachments';

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
	path: '/postMessage',
	method: 'POST',
	handler: postMessageHandler
});

http.route({
	path: '/uploadAttachment',
	method: 'POST',
	handler: uploadAttachment
});

http.route({
	path: '/uploadAttachment',
	method: 'OPTIONS',
	handler: httpAction(async (_, request) => {
		// Make sure the necessary headers are present
		// for this to be a valid pre-flight request
		const headers = request.headers;
		if (
			headers.get('Origin') !== null &&
			headers.get('Access-Control-Request-Method') !== null &&
			headers.get('Access-Control-Request-Headers') !== null
		) {
			return new Response(null, {
				headers: new Headers({
					// e.g. https://mywebsite.com, configured on your Convex dashboard
					'Access-Control-Allow-Origin': process.env.CLIENT_ORIGIN!,
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
