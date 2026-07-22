import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from './Input';
import { Button } from './Button';
import { Modal } from './Modal';
import { Trainer } from '@/types';

const trainerSchema = z.object({
    name: z.string().min(1, 'Trainer name is required'),
    email: z.string().email('Valid email is required'),
    subjects: z.string().min(1, 'Subjects are required'), // Comma separated
    location: z.string().min(1, 'Location is required'),
    hourlyRate: z.number().min(0).optional(),
    rating: z.number().min(1).max(5).optional(),
});

type TrainerFormValues = z.infer<typeof trainerSchema>;

interface TrainerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Trainer>) => Promise<void>;
    trainer?: Trainer | null;
}

export function TrainerModal({ isOpen, onClose, onSubmit, trainer }: TrainerModalProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<TrainerFormValues>({
        resolver: zodResolver(trainerSchema),
        defaultValues: {
            hourlyRate: 0,
            rating: 5,
        }
    });

    useEffect(() => {
        if (trainer && isOpen) {
            reset({
                name: trainer.name,
                email: trainer.email,
                subjects: trainer.subjects.join(', '),
                location: trainer.location,
                hourlyRate: trainer.hourlyRate || 0,
                rating: trainer.rating || 5,
            });
        } else {
            reset({
                name: '',
                email: '',
                subjects: '',
                location: '',
                hourlyRate: 0,
                rating: 5,
            });
        }
    }, [trainer, isOpen, reset]);

    const handleFormSubmit = async (data: TrainerFormValues) => {
        const formattedData: Partial<Trainer> = {
            ...data,
            subjects: data.subjects.split(',').map((s) => s.trim()).filter(Boolean),
        };
        await onSubmit(formattedData);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={trainer ? 'Edit Trainer' : 'Create Trainer'}>
            <form id="trainer-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                <Input label="Full Name *" error={errors.name?.message} {...register('name')} />
                <Input type="email" label="Email Address *" error={errors.email?.message} {...register('email')} />

                <Input label="Expertise Subjects (comma separated) *" placeholder="e.g. Next.js, Docker" error={errors.subjects?.message} {...register('subjects')} />

                <Input label="Location (City or Remote) *" error={errors.location?.message} {...register('location')} />

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
                        <input type="number" step="0.01" className="w-full rounded-lg border border-gray-300 px-4 py-2" {...register('hourlyRate', { valueAsNumber: true })} />
                        {errors.hourlyRate && <p className="text-red-500 text-sm mt-1">{errors.hourlyRate.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Experience Rating (1-5)</label>
                        <select className="w-full rounded-lg border border-gray-300 px-4 py-2" {...register('rating', { valueAsNumber: true })}>
                            {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v} Stars</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t space-x-2 mt-6">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={isSubmitting}>Save</Button>
                </div>
            </form>
        </Modal>
    );
};
