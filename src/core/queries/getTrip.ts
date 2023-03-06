import db from "db"
import * as z from "zod"

const GetTrip = z.object({
  id: z.string(),
})

export default async function getProject(input: z.infer<typeof GetTrip>) {
  // Validate the input
  // const data = GetTrip.parse(input)

  // Require user to be logged in
  //   ctx.session.$authorize()

  const trip = await db.trip.findFirst({ where: { id: input.id } })

  // Can do any processing, fetching from other APIs, etc

  return trip
}
