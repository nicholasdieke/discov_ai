import { Ctx } from "@blitzjs/next"
import db from "db"

export default async function getTripsByUser(_, ctx: Ctx) {
  // Validate the input

  // Require user to be logged in
  ctx.session.$authorize()

  const trips = await db.trip.findMany({ where: { userId: ctx.session.userId } })
  return trips
}
