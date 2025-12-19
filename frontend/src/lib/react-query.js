import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // auth-safe default
      refetchOnWindowFocus: true, // required for /me
      refetchOnReconnect: true,
      staleTime: 60 * 1000, // 1 minute
    },
  },
})
