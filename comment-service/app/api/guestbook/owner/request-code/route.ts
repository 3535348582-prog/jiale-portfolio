import { handle, requestOwnerLoginCode } from "@/lib/guestbook-server";
export const OPTIONS = (request: Request) => handle(request, async () => ({}));
export const POST = (request: Request) => handle(request, () => requestOwnerLoginCode(request));
