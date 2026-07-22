import React, { useState } from 'react';
import Header from '@/components/layouts/Header';
import { useTrainers } from '@/hooks/useTrainers';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Loader } from '@/components/ui/Loader';
import { toast } from 'react-hot-toast';
import { Trainer } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { TrainerModal } from '@/components/ui/TrainerModal';

export default function Trainers() {
  const { user, isLoading: authLoading, logout } = useAuth(true);
  const { trainers, isLoading, error, createTrainer, updateTrainer, deleteTrainer } = useTrainers();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTrainer, setActiveTrainer] = useState<Trainer | null>(null);

  const handleDeleteClick = (trainer: Trainer) => {
    setActiveTrainer(trainer);
    setIsDeleteModalOpen(true);
  };

  const handleEditClick = (trainer: Trainer) => {
    setActiveTrainer(trainer);
    setIsModalOpen(true);
  };

  const handleCreateClick = () => {
    setActiveTrainer(null);
    setIsModalOpen(true);
  };

  const handleTrainerSubmit = async (data: Partial<Trainer>) => {
    try {
      if (activeTrainer) {
        await updateTrainer(activeTrainer.id, data);
        toast.success('Trainer updated successfully.');
      } else {
        await createTrainer(data as any);
        toast.success('Trainer created successfully.');
      }
    } catch {
      // Handled by interceptor
    }
  };

  const confirmDelete = async () => {
    if (activeTrainer) {
      try {
        await deleteTrainer(activeTrainer.id);
        toast.success('Trainer deleted successfully.');
      } catch {
        // toast handled by apiClient interceptor
      } finally {
        setIsDeleteModalOpen(false);
        setActiveTrainer(null);
      }
    }
  };

  const columns = [
    { key: 'name', header: 'Trainer Name' },
    {
      key: 'subjects',
      header: 'Subjects',
      render: (item: Trainer) => item.subjects.join(', '),
    },
    { key: 'location', header: 'Location' },
    {
      key: 'email',
      header: 'Email / Hourly Rate',
      render: (item: Trainer) => (
        <div>
          <a href={`mailto:${item.email}`} className="text-blue-600 hover:underline block">
            {item.email}
          </a>
          <span className="text-xs text-gray-500 mt-1 block">
            Rate: ${item.hourlyRate}/h &nbsp; | &nbsp; Rating: {item.rating} ⭐
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Trainer) => (
        <div className="flex space-x-2">
          <Button variant="secondary" size="sm" onClick={() => handleEditClick(item)}>Edit</Button>
          <Button variant="danger" size="sm" onClick={() => handleDeleteClick(item)}>Delete</Button>
        </div>
      ),
    },
  ];

  if (authLoading || !user) return <Loader fullScreen />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user.username} onSignOut={logout} />

      <main className="container mx-auto p-6 max-w-6xl mt-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Trainers Management</h1>
            <p className="text-gray-500 mt-1">Manage and view all registered trainers.</p>
          </div>
          <Button variant="primary" onClick={handleCreateClick}>Create Trainer</Button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
            Failed to load trainers.
          </div>
        )}

        {isLoading ? (
          <Loader />
        ) : (
          <Table columns={columns} data={trainers} emptyMessage="No trainers found. Create one!" />
        )}
      </main>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-gray-600">
          Are you sure you want to delete the trainer <strong>{activeTrainer?.name}</strong>? This action cannot be undone.
        </p>
      </Modal>

      <TrainerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        trainer={activeTrainer}
        onSubmit={handleTrainerSubmit}
      />
    </div>
  );
}
