import useSWR from 'swr';
import apiClient from '@/services/apiClient';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

interface AuthUser {
    userId: string;
    username: string;
    role: string;
}

const fetcher = (url: string) => apiClient.get<AuthUser>(url).then((res) => res.data);

export function useAuth(requireAuth = true) {
    const router = useRouter();
    const { data: user, error, isLoading, mutate } = useSWR<AuthUser>('/api/auth/me', fetcher, {
        shouldRetryOnError: false,
    });

    useEffect(() => {
        if (!isLoading && requireAuth && error) {
            router.replace('/login');
        }
        if (!isLoading && !requireAuth && user && router.pathname === '/login') {
            router.replace('/');
        }
    }, [user, error, isLoading, requireAuth, router]);

    const logout = async () => {
        await apiClient.delete('/api/auth/login');
        mutate(undefined, false);
        router.push('/login');
    };

    return {
        user,
        isLoading,
        isAuthenticated: !!user,
        logout,
    };
}
