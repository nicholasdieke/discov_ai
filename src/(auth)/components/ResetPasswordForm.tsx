"use client"
import { Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { Box, Flex, Heading, Show, Stack } from "@chakra-ui/react"
import { PromiseReturnType } from "blitz"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/router"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "src/components/ui/button"
import { Field } from "src/components/ui/field"
import { PasswordInput } from "src/components/ui/password-input"
import Header from "src/core/components/Header"
import { z } from "zod"
import resetPassword from "../mutations/resetPassword"
import { ResetPassword } from "../validations"

type ResetPasswordFormProps = {
  onSuccess?: (user: PromiseReturnType<typeof resetPassword>) => void
}

export const ResetPasswordForm = (_props: ResetPasswordFormProps) => {
  const searchParams = useSearchParams()
  const token = searchParams?.get("token")?.toString()
  const [resetPasswordMutation] = useMutation(resetPassword)
  const [formError, setFormError] = useState("")
  const router = useRouter()

  type ResetPasswordValues = z.infer<typeof ResetPassword>

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ResetPasswordValues>()

  const onSubmit = handleSubmit(async () => {
    const values = getValues()
    try {
      await resetPasswordMutation({ ...values, token })
        .then(() => router.push(Routes.MyTripsPage().href))
        .catch((e) => console.log(e))
    } catch (error) {
      if (error.name === "ResetPasswordError") {
        setFormError(error.message)
      } else {
        setFormError("Sorry, we had an unexpected error. Please try again.")
      }
    }
  })

  return (
    <Box className="authBg">
      <Box pos="absolute" top="0" w="full" px={{ base: "1.5rem", lg: "6rem" }}>
        <Header theme="dark" showAuth={false} />
      </Box>
      <Flex className="authFormBox">
        <Heading mb="2rem" textAlign="center">
          Reset password
        </Heading>
        <form onSubmit={onSubmit}>
          <Stack gap="4" align="flex-start" maxW="sm">
            <Field
              label="Password"
              invalid={!!errors.password}
              errorText={errors.password?.message}
            >
              <PasswordInput
                variant="subtle"
                {...register("password", { required: "Password is required" })}
              />
            </Field>

            <Field
              label="Confirm Password"
              invalid={!!errors.confirmPassword}
              errorText={errors.confirmPassword?.message}
            >
              <PasswordInput
                variant="subtle"
                {...register("confirmPassword", { required: "Confirm password is required" })}
              />
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
