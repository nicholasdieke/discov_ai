import { PrismaClient } from "@prisma/client"
import { enhancePrisma } from "blitz"
import * as dotenv from "dotenv"

const EnhancedPrisma = enhancePrisma(PrismaClient)
dotenv.config()

export * from "@prisma/client"
const db = new EnhancedPrisma()
export default db
