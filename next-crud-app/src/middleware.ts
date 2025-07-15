export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/projects(.*)",
    "/dashboard(.*)",
    "/((?!api|_next|static|favicon.ico).*)",
  ],
};
