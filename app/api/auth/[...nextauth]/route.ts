import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  // ✅ FIX: separate cookies for localhost vs production
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token-local",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        token.email = profile.email
      }
      return token
    },

    async session({ session, token }) {
      session.user.email = token.email as string
      return session
    },

    // ✅ redirect to your auth-success page
    async redirect({ url, baseUrl }) {
      return baseUrl + "/auth-success"
    },
  },
})

export { handler as GET, handler as POST }