import { deleteComment, handle } from "@/lib/guestbook-server";
type Context = { params: Promise<{ id: string }> };
export const OPTIONS = (request: Request) => handle(request, async () => ({}));
export const DELETE = (request: Request, context: Context) => handle(request, async () => deleteComment(request, (await context.params).id));
