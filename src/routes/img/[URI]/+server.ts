import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const OPTIONS: RequestHandler = async () => {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400'
        }
    });
};

export const GET: RequestHandler = async ({ params, url }) => {
    const { URI } = params;

    if (!URI) {
        throw error(400, 'URI parameter is required');
    }

    // Decode the URI parameter
    let imageUrl: string;
    try {
        imageUrl = decodeURIComponent(URI);
        // Validate it's a valid URL
        new URL(imageUrl);
    } catch {
        throw error(400, 'Invalid URI parameter');
    }

    try {
        // Fetch the image from the provided URI
        const response = await fetch(imageUrl);

        if (!response.ok) {
            throw error(response.status, `Failed to fetch image: ${response.statusText}`);
        }

        // Get the content type
        const contentType = response.headers.get('content-type') || 'application/octet-stream';

        // Validate it's an image
        if (!contentType.startsWith('image/')) {
            throw error(400, 'URI does not point to an image');
        }

        // Get the image data
        const imageBuffer = await response.arrayBuffer();

        // Generate ETag for better caching
        const etag = `"${Buffer.from(imageUrl).toString('base64').slice(0, 16)}"`;

        // Return the image with caching headers for 24 hours
        return new Response(imageBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400', // 24 hours = 86400 seconds
                'Expires': new Date(Date.now() + 86400000).toUTCString(), // 24 hours from now
                'Content-Length': imageBuffer.byteLength.toString(),
                'ETag': etag,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        });
    } catch (err) {
        if (err instanceof Error && 'status' in err) {
            throw err; // Re-throw SvelteKit errors
        }
        throw error(500, 'Failed to fetch image');
    }
};