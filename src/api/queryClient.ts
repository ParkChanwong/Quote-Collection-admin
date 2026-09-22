import { QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: (count, error) => {
                if (isAxiosError(error) && error.response && error.response.status < 500) return false;
                return count < 1;
            },
        },
        mutations: { retry: false },
    },
});
