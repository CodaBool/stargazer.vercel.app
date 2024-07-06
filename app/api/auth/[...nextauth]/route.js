import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function sendVerificationRequest({ identifier: email, url }) {
  const urlParams = new URLSearchParams({
    subject: "Sign into Community Maps",
    to: email,
    name: "contributor",
    from: "Community Maps",
    secret: process.env.EMAIL_SECRET,
    body: `Please click here to authenticate - ${url}`
  }).toString()
  // just keep email contents in a param for now
  const response = await fetch(`https://email.codabool.workers.dev/?${urlParams}`, {
    body: "{}",
    method: "POST",
  })

  if (!response.ok) {
    console.log(response)
    const res = await response.text()
    throw new Error(res)
  }
}

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 31556952, // in seconds (31,556,952 = 1 year), comment out for added security
  },
  providers: [{
    id: "http-email",
    name: "Email",
    type: "email",
    maxAge: 60 * 60 * 24, // Email link will expire in 24 hours
    sendVerificationRequest,
  }],
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
