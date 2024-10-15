import { Routes } from "@blitzjs/next"
import { SignupForm } from "../../(auth)/components/SignupForm"

export default function SignUpPage() {
  return <SignupForm />
}

SignUpPage.redirectAuthenticatedTo = Routes.Home()
