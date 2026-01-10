import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const body = (await request.json()) as HandleUploadBody;
 
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
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Get notified of client upload completion
        console.log('blob upload completed', blob, tokenPayload);
      },
    });
 
    return new Response(JSON.stringify(jsonResponse));
  } catch (error) {
    return new Response(
      JSON.stringify(
        { error: (error as Error).message },
      ),
      { status: 400 },
    );
  }
}
