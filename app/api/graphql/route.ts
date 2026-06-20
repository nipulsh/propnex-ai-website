import { yoga } from "@/server/graphql/yoga";
import { gqlDebug } from "@/server/graphql/debug";

export const runtime = "nodejs";
export const maxDuration = 60;

async function handleGraphQLRequest(request: Request) {
  const start = performance.now();
  gqlDebug("route:handler:start", { method: request.method });

  try {
    const response = await yoga.fetch(request);
    gqlDebug("route:handler:end", {
      method: request.method,
      status: response.status,
      ms: Math.round(performance.now() - start),
    });
    return response;
  } catch (error) {
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
