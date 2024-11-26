"use client"
import { useSession } from "@blitzjs/auth"
import { Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { Box, Button, MenuTrigger, Show } from "@chakra-ui/react"
import router from "next/router"
import { LuLogIn, LuLogOut, LuLuggage, LuUserCircle, LuUserPlus } from "react-icons/lu"
import logout from "src/(auth)/mutations/logout"
import { MenuContent, MenuItem, MenuRoot } from "src/components/ui/menu"

function UserMenu() {
  const session = useSession({ suspense: false })
  const [logoutMutation] = useMutation(logout)

  return (
    <MenuRoot>
      {/* @ts-ignore */}
      <MenuTrigger asChild>
        <Button variant="ghost" px="1rem" size="lg">
          <LuUserCircle />
          {session.name}
        </Button>
      </MenuTrigger>
      {/* @ts-ignore */}
      <MenuContent>
        <Show when={!session.userId}>
          {/* @ts-ignore */}
          <MenuItem asChild value="Log In">
            <a href={Routes.LoginPage().href}>
              <LuLogIn />
              Log In
            </a>
          </MenuItem>
          {/* @ts-ignore */}
          <MenuItem asChild value="Sign Up">
            <a href={Routes.SignUpPage().href}>
              <LuUserPlus />
              Sign Up
            </a>
          </MenuItem>
        </Show>
        <Show when={session.userId}>
          {/* @ts-ignore */}
          <MenuItem asChild value="My Trips">
            <a href={Routes.MyTripsPage().href}>
              <LuLuggage />
              My Trips
            </a>
          </MenuItem>
          {/* @ts-ignore */}
          <MenuItem asChild value="Log Out">
            <Box
              onClick={async () => {
                await logoutMutation()
                router.reload()
              }}
            >
              <LuLogOut />
              Log Out
            </Box>
          </MenuItem>
        </Show>
      </MenuContent>
    </MenuRoot>
  )
}

export default UserMenu
