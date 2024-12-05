import { Button } from "@/components/ui/button"
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from "@/components/ui/menu"
import { Box, IconButton, Show } from "@chakra-ui/react"
import { faShareNodes } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import mixpanel from "mixpanel-browser"
import { useRouter } from "next/router"
import { LuClipboard, LuMailOpen, LuMessageCircle } from "react-icons/lu"

const ShareButton = ({ isMobile, destination, theme = "white" }) => {
  const router = useRouter()

  const shareMessage = `Check out the trip to ${
    destination.split(", ")[0]
  } I made on DiscovAI! www.discovai.com${router.asPath}`

  function copyURI(evt) {
    evt.preventDefault()
    navigator.clipboard.writeText(shareMessage).then(
      () => {},
      () => {}
    )
  }

  return (
    <MenuRoot>
      <Show when={isMobile}>
        {/* @ts-ignore */}
        <MenuTrigger asChild>
          <IconButton
            _focus={{ boxShadow: "outline" }}
            variant={theme === "black" ? "solid" : "solid"}
          >
            <FontAwesomeIcon icon={faShareNodes} height="18px" />
          </IconButton>
        </MenuTrigger>
      </Show>
      <Show when={!isMobile}>
        {/* @ts-ignore */}
        <MenuTrigger asChild>
          <Button _focus={{ boxShadow: "outline" }}>
            <FontAwesomeIcon icon={faShareNodes} height="18px" />
            Share
          </Button>
        </MenuTrigger>
      </Show>
      {/* @ts-ignore */}
      <MenuContent>
        {/* @ts-ignore */}
        <MenuItem value="whatsapp" asChild>
          <a
            href={`whatsapp://send?text=${shareMessage}`}
            data-action="share/whatsapp/share"
            onClick={() => mixpanel.track("Shared Trip", { platform: "WhatsApp" })}
          >
            <LuMessageCircle />
            <Box flex="1">Whatsapp</Box>
          </a>
        </MenuItem>
        {/* @ts-ignore */}
        <MenuItem value="email" asChild>
          <a
            href={`mailto:?body=${shareMessage}body&subject=${
              destination.split(",")[0]
            } Trip | DiscovAI`}
            onClick={() => mixpanel.track("Shared Trip", { platform: "Email" })}
          >
            <LuMailOpen />
            <Box flex="1">Email</Box>
          </a>
        </MenuItem>

        <Show when={!!navigator.clipboard}>
          {/* @ts-ignore */}
          <MenuItem value="clipboard" asChild>
            <Box
              onClick={(e) => {
                copyURI(e)
                /* toaster.create({
                            description: "File saved successfully",
                            type: "info",
                          }) */
                mixpanel.track("Shared Trip", { platform: "Clipboard" })
              }}
            >
              <LuClipboard />
              <Box flex="1">Clipboard</Box>
            </Box>
          </MenuItem>
        </Show>
      </MenuContent>
    </MenuRoot>
  )
}

export default ShareButton
