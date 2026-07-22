import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Loader } from './Loader';
import { toast } from 'react-hot-toast';
import apiClient from '@/services/apiClient';
import { Course, Trainer } from '@/types';
import useSWR from 'swr';

interface MatchSuggestion {
    trainerId: string;
    trainerName: string;
    trainerEmail: string;
    score: number;
    reasoning: string;
    subjectMatch: boolean;
    locationMatch: boolean;
}

interface AssignTrainerModalProps {
    isOpen: boolean;
    onClose: () => void;
    course: Course;
    onAssigned: () => void;
}

export function AssignTrainerModal({ isOpen, onClose, course, onAssigned }: AssignTrainerModalProps) {
    const [isAssigning, setIsAssigning] = useState(false);

    // Fetch AI suggestions using SWR
    const { data: suggestions, isLoading } = useSWR<MatchSuggestion[]>(
        isOpen ? `/api/courses/${course.id}/suggest-trainers` : null,
        (url: string) => apiClient.get(url).then(res => res.data)
    );

    const handleAssign = async (trainerId: string) => {
        setIsAssigning(true);
        try {
            await apiClient.post(`/api/courses/${course.id}/assign`, { trainerId });
            toast.success('Trainer correctly assigned and notified via email.');
            onAssigned();
            onClose();
        } catch (error: any) {
            // Error mapped handled in interceptor mostly, but specific conflict error needs manual toast if 409
            if (error.response?.status === 409) {
                toast.error(error.response.data.error || 'Conflict detected');
            }
        } finally {
            setIsAssigning(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Assign Trainer to ${course.name}`}>
            <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                    Our AI has analyzed the course requirements and suggested the following available trainers.
                </p>

                {isLoading ? (
                    <Loader message="AI is generating optimal assignments..." />
                ) : !suggestions || suggestions.length === 0 ? (
                    <div className="p-4 bg-gray-50 border rounded text-center text-gray-500">
                        No available trainers found.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {suggestions.map((suggestion) => (
                            <div key={suggestion.trainerId} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-gray-900">{suggestion.trainerName}</h4>
                                        <p className="text-sm text-gray-500">{suggestion.trainerEmail}</p>
                                        <div className="mt-2 text-xs">
                                            <span className={`inline-block px-2 py-1 rounded mr-2 ${suggestion.subjectMatch ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                Subject Match
                                            </span>
                                            <span className={`inline-block px-2 py-1 rounded ${suggestion.locationMatch ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                Location Match
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 mt-3 italic">{suggestion.reasoning}</p>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <div className="text-2xl font-black text-blue-600 space-y-1 mb-2">
                                            {suggestion.score}%
                                            <span className="block text-[10px] text-gray-400 font-normal uppercase">AI Score</span>
                                        </div>
                                        <Button
                                            size="sm"
                                            disabled={isAssigning}
                                            onClick={() => handleAssign(suggestion.trainerId)}
                                        >
                                            Assign
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="mt-6 text-right">
                <Button variant="secondary" onClick={onClose} disabled={isAssigning}>Cancel</Button>
            </div>
        </Modal>
    );
}
