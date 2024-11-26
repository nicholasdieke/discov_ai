"use client"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/navigation"
import { Button } from "src/components/ui/button"
import logout from "../mutations/logout"

export function LogoutButton({ theme = "white" }) {
  const router = useRouter()
  const [logoutMutation] = useMutation(logout)
  return (
    <>
      <Button
        variant="solid"
        colorScheme="whiteAlpha"
        onClick={async () => {
          await logoutMutation()
          router.refresh()
        }}
      >
        Logout
      </Button>
    </>
  )
}
