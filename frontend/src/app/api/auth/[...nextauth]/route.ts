import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "mock-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "mock-client-secret",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || "http://localhost:8000/api/v1";

        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await res.json();
          if (res.ok && data.token) {
            return {
              id: data.user.id || credentials.email,
              email: data.user.email,
              name: data.user.full_name,
              accessToken: data.token,
            };
          }
          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        // user object is only available on sign in
        token.id = user.id;
        // @ts-expect-error - Custom property
        token.accessToken = user.accessToken;
      }
      
      // If signed in with Google, we mock an access token for the backend or 
      // handle it here if backend supported it. For now, we attach a mock token 
      // if it's missing, so the frontend API wrapper doesn't crash, or leave it null.
      if (account?.provider === "google") {
        // Normally we'd exchange the Google token with our backend here.
        if (!token.accessToken) token.accessToken = account.id_token || "google-mock-token";
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        if (session.user) {
          // @ts-expect-error - Custom property
          session.user.id = token.id;
        }
        // @ts-expect-error - Custom property
        session.accessToken = token.accessToken;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET ?? "fallback-secret-for-development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
