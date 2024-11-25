import { Button, Flex, Text, Textarea, useDisclosure } from "@chakra-ui/react"
import mixpanel from "mixpanel-browser"
import { useState } from "react"
import {
  DialogActionTrigger,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "src/components/ui/dialog"
import { toaster } from "src/components/ui/toaster"
import createFeedback from "../mutations/createFeedback"

function Footer({ theme }) {
  mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN)
  const { open, onOpen, onClose } = useDisclosure()
  const [comment, setComment] = useState("")
  const onSubmit = async () => {
    await createFeedback({ comment }).catch((e) => console.log(e))
    onClose()
    mixpanel.track("Submitted Feedback")
    toaster.create({
      title: "Feedback Submitted.",
      description: "Thank you for your feedback.",
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "bottom-right",
    })
  }

  return (
    <Flex
      justifyContent="space-between"
      pb={{ base: "0.5rem", md: "1.5rem" }}
      pt="0.5rem"
      alignItems="center"
      color={theme}
    >
      <Text>© 2024 DiscovAI</Text>

      <DialogRoot open={open} onClose={onClose} size="md">
        <DialogTrigger asChild>
          <Button variant="unstyled">Give Feedback</Button>
        </DialogTrigger>
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
            <Button variant="primary" disabled={comment === ""} mr={3} onClick={onSubmit}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Flex>
  )
}

export default Footer
