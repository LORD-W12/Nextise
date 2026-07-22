import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from './Input';
import { Button } from './Button';
import { Modal } from './Modal';
import { Course, CourseStatus } from '@/types';

const courseSchema = z.object({
    name: z.string().min(1, 'Course name is required'),
    date: z.string().min(1, 'Course date is required'),
    endDate: z.string().optional(),
    subject: z.string().min(1, 'Subject is required'), // Comma separated
    location: z.string().min(1, 'Location is required'),
    participants: z.number().min(1, 'Minimum 1 participant required'),
    notes: z.string().optional(),
    price: z.number().min(0, 'Price must be 0 or higher'),
    trainerPrice: z.number().min(0, 'Trainer price must be 0 or higher'),
    status: z.enum(['draft', 'scheduled', 'completed', 'cancelled']),
});

type CourseFormValues = z.infer<typeof courseSchema>;

interface CourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Course>) => Promise<void>;
    course?: Course | null;
}

export function CourseModal({ isOpen, onClose, onSubmit, course }: CourseModalProps) {
    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CourseFormValues>({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            status: 'scheduled',
            participants: 1,
            price: 0,
            trainerPrice: 0,
        },
    });

    useEffect(() => {
        if (course && isOpen) {
            reset({
                name: course.name,
                date: course.date ? new Date(course.date).toISOString().split('T')[0] : '',
                endDate: course.endDate ? new Date(course.endDate).toISOString().split('T')[0] : '',
                subject: course.subject.join(', '),
                location: course.location,
                participants: course.participants,
                notes: course.notes || '',
                price: course.price,
                trainerPrice: course.trainerPrice || 0,
                status: course.status || 'scheduled',
            });
        } else {
            reset({
                name: '',
                date: '',
                endDate: '',
                subject: '',
                location: '',
                participants: 1,
                notes: '',
                price: 0,
                trainerPrice: 0,
                status: 'scheduled',
            });
        }
    }, [course, isOpen, reset]);

    const handleFormSubmit = async (data: CourseFormValues) => {
        const formattedData: Partial<Course> = {
            ...data,
            date: new Date(data.date).toISOString(),
            endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
            subject: data.subject.split(',').map((s) => s.trim()).filter(Boolean),
        };
        await onSubmit(formattedData);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={course ? 'Edit Course' : 'Create Course'}>
            <form id="course-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                <Input label="Course Name *" error={errors.name?.message} {...register('name')} />
                <div className="grid grid-cols-2 gap-4">
                    <Input type="date" label="Start Date *" error={errors.date?.message} {...register('date')} />
                    <Input type="date" label="End Date" error={errors.endDate?.message} {...register('endDate')} />
                </div>
                <Input label="Subject (comma separated) *" placeholder="e.g. React, Node.js" error={errors.subject?.message} {...register('subject')} />
                <Input label="Location *" error={errors.location?.message} {...register('location')} />

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Participants *</label>
                        <input type="number" className="w-full rounded-lg border border-gray-300 px-4 py-2" {...register('participants', { valueAsNumber: true })} />
                        {errors.participants && <p className="text-red-500 text-sm mt-1">{errors.participants.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select className="w-full rounded-lg border border-gray-300 px-4 py-2" {...register('status')}>
                            <option value="draft">Draft</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Client Price ($) *</label>
                        <input type="number" step="0.01" className="w-full rounded-lg border border-gray-300 px-4 py-2" {...register('price', { valueAsNumber: true })} />
                        {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Trainer Payout ($) *</label>
                        <input type="number" step="0.01" className="w-full rounded-lg border border-gray-300 px-4 py-2" {...register('trainerPrice', { valueAsNumber: true })} />
                        {errors.trainerPrice && <p className="text-red-500 text-sm mt-1">{errors.trainerPrice.message}</p>}
                    </div>
                </div>

                <Input label="Notes" error={errors.notes?.message} {...register('notes')} />

                <div className="flex justify-end pt-4 border-t space-x-2 mt-6">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={isSubmitting}>Save</Button>
                </div>
            </form>
        </Modal>
    );
};
