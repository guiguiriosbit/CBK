import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/db/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Correo y contraseña",
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials.password) {
            console.error("[AUTH] Faltan credenciales")
            throw new Error("Correo y contraseña son obligatorios")
          }

          // Normalizar email a minúsculas
          const email = credentials.email.toLowerCase().trim()

          const user = await prisma.user.findUnique({
            where: { email },
          })

          if (!user) {
            console.error(`[AUTH] Usuario no encontrado: ${email}`)
            throw new Error("Credenciales inválidas")
          }

          if (!user.passwordHash) {
            console.error(`[AUTH] Usuario sin contraseña: ${email}`)
            throw new Error("Credenciales inválidas")
          }

          // Verificar si el hash parece ser de bcrypt (empieza con $2a$, $2b$, o $2y$)
          const isBcryptHash = user.passwordHash.startsWith("$2a$") || 
                              user.passwordHash.startsWith("$2b$") || 
                              user.passwordHash.startsWith("$2y$")

          if (!isBcryptHash) {
            console.error(`[AUTH] Hash de contraseña inválido para usuario: ${email}`)
            throw new Error("Error de autenticación. Por favor, restablece tu contraseña.")
          }

          const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
          
          if (!isValid) {
            console.error(`[AUTH] Contraseña incorrecta para usuario: ${email}`)
            throw new Error("Credenciales inválidas")
          }

          console.log(`[AUTH] Login exitoso para: ${email}`)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error: any) {
          console.error("[AUTH] Error en authorize:", error)
          // Re-lanzar el error para que NextAuth lo maneje
          throw error
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role ?? "cliente"
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.id as string
        ;(session.user as any).role = (token as any).role ?? "cliente"
      }
      return session
    },
  },
}

