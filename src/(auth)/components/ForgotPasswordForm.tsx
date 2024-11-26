"use client"
import { useMutation } from "@blitzjs/rpc"
import { Box, Flex, Heading, Input, Show, Stack } from "@chakra-ui/react"
import { PromiseReturnType } from "blitz"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "src/components/ui/button"
import { Field } from "src/components/ui/field"
import Header from "src/core/components/Header"
import { z } from "zod"
import forgotPassword from "../mutations/forgotPassword"

type ForgotPasswordFormProps = {
  onSuccess?: (user: PromiseReturnType<typeof forgotPassword>) => void
}

export const ForgotPasswordForm = (_props: ForgotPasswordFormProps) => {
  const [forgotPasswordMutation] = useMutation(forgotPassword)
  const [formError, setFormError] = useState("")

  const forgotPasswordSchema = z.object({
    email: z.string().email({ message: "Email is required" }),
  })

  type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordValues>()

  const onSubmit = handleSubmit(async () => {
    const values = getValues()
    try {
      await forgotPasswordMutation(values)
    } catch (error: any) {
      setFormError("Sorry, we had an unexpected error. Please try again.")
    }
  })

  return (
    <Box className="authBg">
      <Box pos="absolute" top="0" w="full" px={{ base: "1.5rem", lg: "6rem" }}>
        <Header theme="dark" showAuth={false} />
      </Box>
      <Flex className="authFormBox">
        <Heading mb="2rem" textAlign="center">
          Forgot your password?
        </Heading>
        <form onSubmit={onSubmit}>
          <Stack gap="4" align="flex-start" maxW="sm">
            <Field label="Email" invalid={!!errors.email} errorText={errors.email?.message}>
              <Input variant="subtle" {...register("email", { required: "Email is required" })} />
            </Field>

            <Show when={formError}>
              <div role="alert" style={{ color: "red" }}>
                {formError}
              </div>
            </Show>

            <Button type="submit" w="full" onClick={onSubmit}>
              Send Reset Password Instructions
            </Button>
          </Stack>
        </form>
      </Flex>
    </Box>
  )
}
