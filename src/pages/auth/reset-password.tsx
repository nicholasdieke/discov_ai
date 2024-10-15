import { Routes } from "@blitzjs/next"
import { ResetPasswordForm } from "../../(auth)/components/ResetPasswordForm"

export default function ResetPasswordPage() {
  return <ResetPasswordForm />
}

ResetPasswordPage.redirectAuthenticatedTo = Routes.Home()
