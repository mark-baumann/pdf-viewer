import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  const body = request.body as HandleUploadBody;
 
  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname /*, clientPayload */) => {
        // Generate a client token for the browser to upload the file
        // ⚠️ Authenticate and authorize users here, otherwise anyone can upload to your project
 
        return {
          allowedContentTypes: ['application/pdf'],
          tokenPayload: JSON.stringify({
            // optional, sent to your server on upload completion
          }),
        };
      },
    });
 
    return response.status(200).json(jsonResponse);
  } catch (error) {
    return response.status(400).json({ error: (error as Error).message });
  }
}