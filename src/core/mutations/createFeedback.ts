import db from "db"
import * as z from "zod"

const CreateFeedback = z
  .object({
    comment: z.string(),
  })
  .nonstrict()

export default async function createFeedback(input: z.infer<typeof CreateFeedback>) {
  // Validate input - very important for security
  const data = CreateFeedback.parse(input)

  // Require user to be logged in
  //   ctx.session.$authorize()

  const trip = await db.feedback.create({ data })

  // Can do any processing, fetching from other APIs, etc

  return trip
}
