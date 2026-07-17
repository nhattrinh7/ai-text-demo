import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "~/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email", placeholder: "test@example.com" },
        password: { label: "Password", type: "password", placeholder: "any password works" }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null

        let user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: credentials.email as string,
              name: (credentials.email as string).split('@')[0],
            }
          })
        }

        return user
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    }
  },
  secret: process.env.AUTH_SECRET,
})
