import { yoga } from "@/server/graphql/yoga";
import { gqlDebug, gqlLog } from "@/server/graphql/debug";

export const runtime = "nodejs";
export const maxDuration = 60;

async function readOperationHint(request: Request): Promise<string | undefined> {
  if (request.method !== "POST") return undefined;
  try {
    const body = (await request.clone().json()) as {
      operationName?: string;
      query?: string;
    };
    if (body.operationName) return body.operationName;
    const match = body.query?.match(/(?:query|mutation)\s+(\w+)/);
    return match?.[1];
  } catch {
    return undefined;
  }
}

async function handleGraphQLRequest(request: Request) {
  const start = performance.now();
  const operation = await readOperationHint(request);

  gqlLog("route:start", {
    method: request.method,
    operation,
    url: request.url,
  });
  gqlDebug("route:handler:start", { method: request.method });

  try {
    const response = await yoga.fetch(request);
    gqlLog("route:done", {
      method: request.method,
      operation,
      status: response.status,
      ms: Math.round(performance.now() - start),
    });
    gqlDebug("route:handler:end", {
      method: request.method,
      status: response.status,
      ms: Math.round(performance.now() - start),
    });
    return response;
  } catch (error) {
    gqlLog("route:error", {
      method: request.method,
      operation,
      ms: Math.round(performance.now() - start),
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    gqlDebug("route:handler:error", {
      method: request.method,
      ms: Math.round(performance.now() - start),
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export async function GET(request: Request) {
  return handleGraphQLRequest(request);
}

export async function POST(request: Request) {
  return handleGraphQLRequest(request);
}

export async function OPTIONS(request: Request) {
  return handleGraphQLRequest(request);
}
