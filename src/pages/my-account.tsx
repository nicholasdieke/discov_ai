import { Routes } from "@blitzjs/next"
import { Box } from "@chakra-ui/react"
import "react-datepicker/dist/react-datepicker.css"

export default function MyAccountPage() {
  return <Box>My account </Box>
}

MyAccountPage.authenticate = { redirectTo: Routes.LoginPage() }
