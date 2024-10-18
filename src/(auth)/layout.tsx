import { useAuthenticatedBlitzContext } from "../blitz-server"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  useAuthenticatedBlitzContext({
    redirectAuthenticatedTo: "/",
  })
  return <>{children}</>
}
