import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isAdmin: boolean;
      status: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    isAdmin: boolean;
    status: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isAdmin: boolean;
    status: string;
  }
}
