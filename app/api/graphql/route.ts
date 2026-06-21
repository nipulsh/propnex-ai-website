import { gqlDebug, gqlLogError } from "@/server/graphql/debug";
import { yoga } from "@/server/graphql/yoga";

export const runtime = "nodejs";
export const maxDuration = 60;

const { handleRequest } = yoga;

async function handleGraphQLRequest(request: Request) {
  const start = performance.now();
  const requestId = crypto.randomUUID().slice(0, 8);

  gqlDebug("route:handler:start", {
    requestId,
    method: request.method,
    url: request.url,
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasClerkSecret: Boolean(process.env.CLERK_SECRET_KEY),
  });

  try {
    const response = await handleRequest(request);
    gqlDebug("route:handler:end", {
      requestId,
      method: request.method,
      status: response.status,
      ms: Math.round(performance.now() - start),
    });
    return response;
  } catch (error) {
    gqlLogError("route:handler:error", error, {
      requestId,
      method: request.method,
      ms: Math.round(performance.now() - start),
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
