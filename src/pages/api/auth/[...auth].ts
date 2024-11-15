import { passportAuth } from "@blitzjs/auth"
import db from "db"
import { Strategy as GoogleStrategy } from "passport-google-oidc"
import { api } from "src/blitz-server"

export default api(
  passportAuth({
    successRedirectUrl: "/",
    errorRedirectUrl: "/",
    strategies: [
      {
        strategy: new GoogleStrategy(
          {
            clientID: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            callbackURL:
              process.env.NODE_ENV === "production"
                ? "https://discovai.com/api/auth/google/callback"
                : "http://localhost:3000/api/auth/google/callback",
            scope: "openid email profile",
          },
          async function verify(_issuer, profile, cb) {
            const email = profile.emails && profile.emails[0]?.value

            if (!email) {
              return cb(new Error("Google OAuth response doesn't have email."))
            }

            const user = await db.user.upsert({
              where: { email },
              create: {
                email,
                name: profile.displayName,
                role: "USER",
              },
              update: { email },
            })

            const publicData = {
              userId: user.id,
              roles: [user.role],
              source: "google",
              name: user.name,
            }
            cb(undefined, { publicData })
          }
        ),
      },
    ],
  })
)