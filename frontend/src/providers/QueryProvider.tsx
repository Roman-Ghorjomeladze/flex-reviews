import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

// Create a client instance
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// Stale time: how long data is considered fresh (5 minutes)
			staleTime: 1000 * 60 * 5,
			// Cache time: how long unused data stays in cache (10 minutes)
			gcTime: 1000 * 60 * 10,
			// Retry failed requests 1 time
			retry: 1,
			// Refetch on window focus
			refetchOnWindowFocus: false,
		},
		mutations: {
			retry: 1,
		},
	},
});

interface QueryProviderProps {
	children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
