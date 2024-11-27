import { Routes } from "@blitzjs/next"
import { Flex, HStack, Link, Text, useDisclosure } from "@chakra-ui/react"
import mixpanel from "mixpanel-browser"
import { useState } from "react"
import createFeedback from "../mutations/createFeedback"

function Footer({ theme = "white" }) {
  mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN)
  const { open, onOpen, onClose } = useDisclosure()
  const [comment, setComment] = useState("")
  const onSubmit = async () => {
    await createFeedback({ comment }).catch((e) => console.log(e))
    onClose()
    mixpanel.track("Submitted Feedback")
    /* toaster.create({
      title: "Feedback Submitted.",
      description: "Thank you for your feedback.",
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "bottom-right",
    }) */
  }

  return (
    <Flex
      justifyContent="space-between"
      pb={{ base: "0.5rem", md: "1.5rem" }}
      pt="1.5rem"
      alignItems="start"
      color={theme}
    >
      <HStack gap="2">
        <Text>© 2024 DiscovAI</Text>
        <Text>·</Text>
        <Link href={Routes.PrivacyPolicyPage().href}>Privacy Policy</Link>
      </HStack>

      {/* <DialogRoot open={open} onClose={onClose} size="md">
        <DialogTrigger>Give Feedback</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Give Feedback</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Textarea
              h="150px"
              placeholder="Please enter your feedback here"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </DialogBody>

          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button variant="outline">Cancel</Button>
            </DialogActionTrigger>
            <Button disabled={comment === ""} mr={3} onClick={onSubmit}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot> */}
    </Flex>
  )
}

export default Footer
