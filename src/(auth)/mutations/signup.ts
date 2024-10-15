import { SecurePassword } from "@blitzjs/auth/secure-password"
import db from "db"

export default async function signup(
  input: { name: string; password: string; email: string },
  ctx: any
) {
  const blitzContext = ctx
  const hashedPassword = await SecurePassword.hash((input.password as string) || "test-password")
  const email = (input.email as string) || "test" + Math.random() + "@test.com"
  const name = (input.name as string) || "Name " + Math.random()
  const user = await db.user.create({
    data: { name, email, hashedPassword },
  })

  await blitzContext.session.$create({
    userId: user.id,
    role: "user",
    name: user.name,
  })

  return { userId: blitzContext.session.userId, ...user, email: input.email }
}
