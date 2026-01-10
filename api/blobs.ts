import { list } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  try {
    const { blobs } = await list();
    return response.status(200).json(blobs);
  } catch (error) {
    return response.status(500).json({ error: (error as Error).message });
  }
}
