import { Ctx } from "@blitzjs/next"
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

export default async function createTrip(input: z.infer<typeof CreateTrip>, ctx?: Ctx) {
  // Validate input - very important for security
  const data = CreateTrip.parse(input)

  const userId = ctx!.session.userId
  const tripData = {
    ...data,
    userId: userId || null, // Add userId if present, otherwise set it to null
  }

  const trip = await db.trip.create({ data: tripData })

  return trip
}
