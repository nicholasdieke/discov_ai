import db from "db"
import * as z from "zod"

const CreateTrip = z
  .object({
    destination: z.string(),
    daterange: z.array(z.date()),
    activity: z.string(),
    group: z.string(),
    itinerary: z.string(),
  })
  .nonstrict()

export default async function createTrip(input: z.infer<typeof CreateTrip>) {
  // Validate input - very important for security
  const data = CreateTrip.parse(input)

  // Require user to be logged in
  //   ctx.session.$authorize()

  const trip = await db.trip.create({ data })

  // Can do any processing, fetching from other APIs, etc

  return trip
}
