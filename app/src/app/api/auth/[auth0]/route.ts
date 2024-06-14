// app/api/auth/[...auth0]/route.ts
import { handleAuth } from "@auth0/nextjs-auth0";

// NOTE: auth0側がcsrf対策をしているため、このAPIはCSRFの検証を行う必要はありません。
export const GET = handleAuth();
