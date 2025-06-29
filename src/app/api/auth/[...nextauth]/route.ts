import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("🔐 Intentando autenticar:", credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Faltan credenciales");
          return null;
        }
        
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) {
          console.log("❌ Usuario no encontrado");
          return null;
        }
        
        console.log("✅ Usuario encontrado:", user.email, "Rol:", user.role);
        
        try {
          const isValid = await compare(credentials.password, user.password);
          console.log("🔍 Comparación de contraseña:", isValid);
          
          if (!isValid) {
            console.log("❌ Contraseña inválida");
            return null;
          }
          
          console.log("✅ Autenticación exitosa");
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.log("❌ Error en comparación:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 