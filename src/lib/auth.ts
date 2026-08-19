import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "8d0c72cfce82dfa59ed8a2835cd186da3654b16b20bba76bd121b8c8c6fc6b41",
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email y contraseña requeridos");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          include: {
            vehicles: { include: { vehicle: true } },
          },
        });

        if (!user || !user.password) {
          throw new Error("Usuario no registrado con contraseña");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Contraseña incorrecta");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          const adminEmails = (process.env.ADMIN_EMAILS || "admin@vecolombia.com,admin@vehiculoselectricoscolombia.com")
            .toLowerCase()
            .split(",")
            .map((e) => e.trim());

          const isAdmin = adminEmails.includes(user.email.toLowerCase());

          // Upsert user in database from Google profile
          await prisma.user.upsert({
            where: { email: user.email.toLowerCase() },
            update: {
              name: user.name || "Usuario Google",
              image: user.image || undefined,
              role: isAdmin ? "ADMIN" : undefined,
              updatedAt: new Date(),
            },
            create: {
              email: user.email.toLowerCase(),
              name: user.name || "Usuario Google",
              image: user.image || undefined,
              role: isAdmin ? "ADMIN" : "USER",
            },
          });
        } catch (error) {
          console.error("Error linking Google account", error);
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "USER";
      } else if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email.toLowerCase() },
          select: { id: true, role: true, image: true, name: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.name = dbUser.name;
          token.picture = dbUser.image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
        session.user.image = token.picture as string | null | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
};
