import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/db";

export async function getAuthenticatedUser(req: NextRequest) {
  try {
    // 1. Check custom session cookie (used by direct login / register)
    const customSessionId = req.cookies.get("ve_session")?.value;
    if (customSessionId) {
      const user = await prisma.user.findUnique({
        where: { id: customSessionId },
        include: {
          vehicles: {
            include: { vehicle: true },
            orderBy: { isPrimary: "desc" },
          },
        },
      });
      if (user) return user;
    }

    // 2. Check NextAuth JWT token (used by Google OAuth & NextAuth credentials)
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET || "8d0c72cfce82dfa59ed8a2835cd186da3654b16b20bba76bd121b8c8c6fc6b41",
    });

    if (token?.email) {
      const user = await prisma.user.findUnique({
        where: { email: token.email.toLowerCase() },
        include: {
          vehicles: {
            include: { vehicle: true },
            orderBy: { isPrimary: "desc" },
          },
        },
      });
      if (user) return user;
    }

    return null;
  } catch (error) {
    console.error("Error getting authenticated user:", error);
    return null;
  }
}
