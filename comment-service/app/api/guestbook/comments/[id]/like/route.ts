import { handle, likeComment } from "@/lib/guestbook-server";
type Context = { params: Promise<{ id: string }> };
export const OPTIONS = (request: Request) => handle(request, async () => ({}));
export const POST = (request: Request, context: Context) => handle(request, async () => likeComment(request, (await context.params).id));
