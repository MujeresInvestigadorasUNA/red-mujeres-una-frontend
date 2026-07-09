import { NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request, { params }) {
  const resolvedParams = await params;
  return proxyRequest(request, resolvedParams.path);
}

export async function POST(request, { params }) {
  const resolvedParams = await params;
  return proxyRequest(request, resolvedParams.path);
}

export async function PUT(request, { params }) {
  const resolvedParams = await params;
  return proxyRequest(request, resolvedParams.path);
}

export async function PATCH(request, { params }) {
  const resolvedParams = await params;
  return proxyRequest(request, resolvedParams.path);
}

export async function DELETE(request, { params }) {
  const resolvedParams = await params;
  return proxyRequest(request, resolvedParams.path);
}

async function proxyRequest(request, pathSegments) {
  const path = Array.isArray(pathSegments) ? pathSegments.join('/') : '';
  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('connection');

  let currentUrl = new URL(`${path}${request.nextUrl.search}` || '/', BASE_URL);
  let currentMethod = request.method;
  let currentBody = undefined;

  if (!['GET', 'HEAD'].includes(currentMethod)) {
    currentBody = await request.arrayBuffer();
    headers.set('content-length', String(currentBody.byteLength));
  }

  let response;

  for (let redirectCount = 0; redirectCount < 5; redirectCount += 1) {
    const init = {
      method: currentMethod,
      headers,
      ...(currentBody && !['GET', 'HEAD'].includes(currentMethod) ? { body: currentBody, duplex: 'half' } : {}),
    };

    response = await fetch(currentUrl, init);

    if (![301, 302, 303, 307, 308].includes(response.status)) {
      break;
    }

    const location = response.headers.get('location');
    if (!location) {
      break;
    }

    currentUrl = new URL(location, currentUrl);

    if ([301, 302, 303].includes(response.status) && !['GET', 'HEAD'].includes(currentMethod)) {
      currentMethod = 'GET';
      currentBody = undefined;
      headers.delete('content-length');
      headers.delete('content-type');
    } else if (['GET', 'HEAD'].includes(currentMethod)) {
      currentBody = undefined;
      headers.delete('content-length');
    }
  }

  const responseBody = await response.arrayBuffer();
  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete('content-length');
  responseHeaders.delete('transfer-encoding');

  return new NextResponse(responseBody, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}
