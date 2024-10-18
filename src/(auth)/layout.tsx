import { useAuthenticatedBlitzContext } from "../blitz-server"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  useAuthenticatedBlitzContext({
    redirectAuthenticatedTo: "/",
  })
  return <>{children}</>
}
