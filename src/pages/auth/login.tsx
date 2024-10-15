import { Routes } from "@blitzjs/next"
import { LoginForm } from "src/(auth)/components/LoginForm"

export default function LoginPage() {
  return <LoginForm />
}

LoginPage.redirectAuthenticatedTo = Routes.Home()
