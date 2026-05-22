import { callAuthBackendRequest } from '@/lib/auth-server';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ petId: string; vaccineId: string }> },
) {
  const { petId, vaccineId } = await context.params;
  try {
    const response = await callAuthBackendRequest(
      `/api/pets/${petId}/vaccines/${vaccineId}`,
      { method: 'GET' },
    );
    return response;
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch vaccine' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ petId: string; vaccineId: string }> },
) {
  const { petId, vaccineId } = await context.params;
  try {
    const body = await request.json();
    const response = await callAuthBackendRequest(
      `/api/pets/${petId}/vaccines/${vaccineId}`,
      { method: 'PATCH', body: JSON.stringify(body) },
    );
    return response;
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to update vaccine' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ petId: string; vaccineId: string }> },
) {
  const { petId, vaccineId } = await context.params;
  try {
    const response = await callAuthBackendRequest(
      `/api/pets/${petId}/vaccines/${vaccineId}`,
      { method: 'DELETE' },
    );
    return response;
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to delete vaccine' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
