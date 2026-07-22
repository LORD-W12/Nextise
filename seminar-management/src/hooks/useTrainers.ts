import useSWR from 'swr';
import apiClient from '@/services/apiClient';
import { Trainer } from '@/types';

const fetcher = (url: string) => apiClient.get<Trainer[]>(url).then((res) => res.data);

export function useTrainers() {
    const { data, error, isLoading, mutate } = useSWR<Trainer[]>('/api/trainers', fetcher);

    const deleteTrainer = async (id: string) => {
        await apiClient.delete(`/api/trainers/${id}`);
        mutate();
    };

    const createTrainer = async (trainerData: Omit<Trainer, 'id'>) => {
        await apiClient.post('/api/trainers', trainerData);
        mutate();
    };

    const updateTrainer = async (id: string, trainerData: Partial<Omit<Trainer, 'id'>>) => {
        await apiClient.put(`/api/trainers/${id}`, trainerData);
        mutate();
    };

    return {
        trainers: data || [],
        isLoading,
        error,
        deleteTrainer,
        createTrainer,
        updateTrainer,
    };
}
