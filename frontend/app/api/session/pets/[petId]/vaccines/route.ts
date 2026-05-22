import { callAuthBackendRequest } from '@/lib/auth-server';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ petId: string }> },
) {
  const { petId } = await context.params;
  try {
    const url = new URL(request.url);
    const baseUrl = `/api/pets/${petId}/vaccines`;
    const query = url.search ? `${url.search}` : '';
    
    const response = await callAuthBackendRequest(
      `${baseUrl}${query}`,
      { method: 'GET' },
    );
    return response;
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch vaccines' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ petId: string }> },
) {
  const { petId } = await context.params;
  try {
    const body = await request.json();
    const response = await callAuthBackendRequest(
      `/api/pets/${petId}/vaccines`,
      { method: 'POST', body: JSON.stringify(body) },
    );
    return response;
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to create vaccine' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
