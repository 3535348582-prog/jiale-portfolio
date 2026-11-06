import { createComment, handle, listComments } from "@/lib/guestbook-server";
export const OPTIONS = (request: Request) => handle(request, async () => ({}));
export const GET = (request: Request) => handle(request, () => listComments(request));
export const POST = (request: Request) => handle(request, () => createComment(request), 201);
