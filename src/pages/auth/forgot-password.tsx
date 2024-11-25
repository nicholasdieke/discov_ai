import { Routes } from "@blitzjs/next"
import { ForgotPasswordForm } from "src/(auth)/components/ForgotPasswordForm"

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}

ForgotPasswordPage.redirectAuthenticatedTo = Routes.Home()
