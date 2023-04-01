import db from "db"
import * as z from "zod"

const GetTrip = z.object({
  id: z.string(),
})

export default async function getProject(input: z.infer<typeof GetTrip>) {
  // Validate the input

  // Require user to be logged in
  //   ctx.session.$authorize()

  if (!!input.id) {
    const trip = await db.trip.findUnique({ where: { id: input.id } })
    return trip
  } else {
    return null
  }
}
