import { Button, Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, Textarea, useDisclosure, useToast } from "@chakra-ui/react";
import mixpanel from 'mixpanel-browser';
import { useState } from "react";
import createFeedback from "../mutations/createFeedback";

function Footer({ theme }) {

  mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN); 
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [comment, setComment] = useState("")
  const toast = useToast()
  const onSubmit = async () => {
    console.log({comment});
    await createFeedback({comment})
          .catch((e) => console.log(e))

    onClose();
    mixpanel.track("Submitted Feedback");
    toast({
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
      <Text>
        © 2023 DiscovAI
      </Text>
      <Button variant="unstyled" onClick={onOpen}>
        Give Feedback
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} size="md" >
          <ModalOverlay />
          <ModalContent bg="gray.700" color="white">
            <ModalHeader>Give Feedback</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Textarea h="150px" placeholder='Please enter your feedback here' value={comment} onChange={(e) => setComment(e.target.value)}/>
            </ModalBody>
  
            <ModalFooter>
              <Button variant='primary' disabled={comment === ""} mr={3} onClick={onSubmit}>
                Submit
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
    </Flex>
  )
}

export default Footer
