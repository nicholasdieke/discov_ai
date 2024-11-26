import { z } from "zod"

export const DiscoverFormValidation = z.object({
  origin: z.string().min(1, { message: "Origin is required" }),
  daterange: z.array(z.date()).nonempty({ message: "Daterange is required" }),
  group: z.array(z.string()).nonempty({ message: "Group is required" }),
  activity: z.array(z.string()).nonempty({ message: "Activity is required" }),
  budget: z.array(z.string()).nonempty({ message: "Budget is required" }),
  distance: z.array(z.string()).nonempty({ message: "Distance is required" }),
  touristy: z.array(z.string()).nonempty({ message: "Touristiness is required" }),
  specactivity: z.string().optional().default(""),
})

export const TripFormValidation = z.object({
  destination: z.string().min(1, { message: "Destination is required" }),
  daterange: z.array(z.date()).nonempty({ message: "Daterange is required" }),
  group: z.array(z.string()).nonempty({ message: "Group is required" }),
  activity: z.array(z.string()).nonempty({ message: "Activity is required" }),
  budget: z.array(z.string()).nonempty({ message: "Budget is required" }),
  extras: z.string().optional().default(""),
})
