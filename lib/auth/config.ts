import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import { prisma } from "@/lib/db/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID ?? "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
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

          // Normalizar email y contraseña (evitar espacios que causan "credenciales inválidas")
          const email = credentials.email.toLowerCase().trim()
          const rawPassword = credentials.password

          // Detectar si es un login con 2FA ya validado
          const isTwoFactorBypassed = rawPassword.endsWith("::2FA_VALIDATED")
          const actualPassword = isTwoFactorBypassed
            ? rawPassword.replace("::2FA_VALIDATED", "").trim()
            : rawPassword.trim()

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

          const isValid = await bcrypt.compare(actualPassword, user.passwordHash)
          
          if (!isValid) {
            console.error(`[AUTH] Contraseña incorrecta para usuario: ${email}`)
            throw new Error("Credenciales inválidas")
          }

          // Si el usuario tiene 2FA activado y aún no se ha validado, requerir 2FA
          if (user.totpEnabled && !isTwoFactorBypassed) {
            console.log(`[AUTH] Usuario ${email} requiere 2FA`)
            throw new Error("TWO_FACTOR_REQUIRED")
          }

          console.log(`[AUTH] Login exitoso para: ${email}`)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            totpEnabled: user.totpEnabled,
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
    async jwt({ token, user, account }) {
      if (user) {
        // Login con correo/contraseña: user ya viene de nuestra BD
        if ((user as any).role !== undefined) {
          token.id = user.id
          token.role = (user as any).role ?? "cliente"
          token.totpEnabled = (user as any).totpEnabled ?? false
          return token
        }
        // Login con Google/Facebook: crear o actualizar usuario en nuestra BD
        const email = (user.email ?? "").toLowerCase().trim()
        if (email) {
          const dbUser = await prisma.user.upsert({
            where: { email },
            create: {
              email,
              name: user.name ?? null,
              role: "cliente",
              emailVerified: new Date(),
            },
            update: {
              name: user.name ?? undefined,
            },
          })
          token.id = dbUser.id
          token.role = dbUser.role
          token.totpEnabled = dbUser.totpEnabled ?? false
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.id as string
        ;(session.user as any).role = (token as any).role ?? "cliente"
        ;(session.user as any).totpEnabled = (token as any).totpEnabled ?? false
      }
      return session
    },
  },
}

