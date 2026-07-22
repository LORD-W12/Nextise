import useSWR from 'swr';
import apiClient from '@/services/apiClient';
import { Course } from '@/types';

const fetcher = (url: string) => apiClient.get<Course[]>(url).then((res) => res.data);

export function useCourses() {
    const { data, error, isLoading, mutate } = useSWR<Course[]>('/api/courses', fetcher);

    const deleteCourse = async (id: string) => {
        await apiClient.delete(`/api/courses/${id}`);
        mutate();
    };

    const createCourse = async (courseData: Omit<Course, 'id'>) => {
        await apiClient.post('/api/courses', courseData);
        mutate();
    };

    const updateCourse = async (id: string, courseData: Partial<Omit<Course, 'id'>>) => {
        await apiClient.put(`/api/courses/${id}`, courseData);
        mutate();
    };

    const assignTrainer = async (courseId: string, trainerId: string) => {
        await apiClient.put(`/api/courses/${courseId}`, { trainerId });
        mutate();
    };

    const removeTrainer = async (courseId: string) => {
        await apiClient.put(`/api/courses/${courseId}`, { trainerId: null });
        mutate();
    };

    return {
        courses: data || [],
        isLoading,
        error,
        deleteCourse,
        createCourse,
        updateCourse,
        assignTrainer,
        removeTrainer,
        mutate,
    };
}
