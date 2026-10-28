import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/app/lib/prisma";

const OAUTH_TIMEOUT = 15000;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma as never),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      allowDangerousEmailAccountLinking: true,
      httpOptions: { timeout: OAUTH_TIMEOUT },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
      httpOptions: { timeout: OAUTH_TIMEOUT },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    async signIn({ account, profile, user }) {
      if (!user.email) return false;
      if (account?.provider === "google") {
        return (profile as { email_verified?: boolean })?.email_verified === true;
      }
      if (account?.provider === "github") {
        const res = await fetch("https://api.github.com/user/emails", {
          headers: {
            Authorization: `Bearer ${account.access_token}`,
            Accept: "application/vnd.github+json",
          },
          signal: AbortSignal.timeout(OAUTH_TIMEOUT),
        });
        if (!res.ok) throw new Error(`GitHub emails ${res.status}`);
        const emails: { email: string; verified: boolean }[] = await res.json();
        return emails.some(
          (e) => e.verified && e.email.toLowerCase() === user.email!.toLowerCase(),
        );
      }
      return false;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
      }
      if (user && account && profile) {
        const raw = profile as { picture?: string; avatar_url?: string };
        const image =
          account.provider === "github" ? raw.avatar_url : raw.picture;
        if (image) {
          token.picture = image;
          if (image !== user.image) {
            await prisma.user.update({ where: { id: user.id }, data: { image } });
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id;
      }
      return session;
    },
  },
};
