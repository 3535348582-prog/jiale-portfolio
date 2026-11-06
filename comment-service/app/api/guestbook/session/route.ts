import { createSession, handle, updateSession } from "@/lib/guestbook-server";
export const OPTIONS = (request: Request) => handle(request, async () => ({}));
export const POST = (request: Request) => handle(request, () => createSession(request), 201);
export const PATCH = (request: Request) => handle(request, () => updateSession(request));
