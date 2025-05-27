// filepath: src/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth"; // Убрали NextAuth
import { DefaultJWT } from "next-auth/jwt"; // Убрали JWT, оставили DefaultJWT

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's id. */
      id: string;
      /** The user's role. */
      role: string; // или ваш конкретный тип для роли, например, UserRole из Prisma
    } & DefaultSession["user"]; // Объединяем с полями по умолчанию
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User extends DefaultUser {
    /** The user's role. */
    role: string; // или ваш конкретный тип для роли
    // id уже есть в DefaultUser, но если вы его переопределяете или хотите быть явным:
    // id: string;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends DefaultJWT {
    /** OpenID ID Token */
    idToken?: string;
    /** The user's role. */
    role: string; // или ваш конкретный тип для роли
    /** The user's id. */
    id: string;
  }
}