// frontend/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
// Importa otros proveedores si los necesitas (GitHub, Facebook, etc.)

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Agrega aquí otros proveedores
  ],
  callbacks: {
    async session({ session, token }) {
      // Asegura que el ID del usuario esté disponible en la sesión
      if (token && session.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
  },
  // Otras configuraciones como base de datos, páginas personalizadas, etc.
};