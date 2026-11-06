import { createSession, getSession, handle, updateSession } from "@/lib/guestbook-server";
export const OPTIONS = (request: Request) => handle(request, async () => ({}));
export const GET = (request: Request) => handle(request, () => getSession(request));
export const POST = (request: Request) => handle(request, () => createSession(request), 201);
export const PATCH = (request: Request) => handle(request, () => updateSession(request));
