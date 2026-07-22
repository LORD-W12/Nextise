import React, { useState } from 'react';
import Header from '@/components/layouts/Header';
import { useCourses } from '@/hooks/useCourses';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'react-hot-toast';
import { CourseModal } from '@/components/ui/CourseModal';
import { AssignTrainerModal } from '@/components/ui/AssignTrainerModal';
import { Course } from '@/types';
import { useAuth } from '@/hooks/useAuth';

export default function Courses() {
  const { user, isLoading: authLoading, logout } = useAuth(true);
  const { courses, isLoading, error, createCourse, updateCourse, deleteCourse, removeTrainer, mutate } = useCourses();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const handleDeleteClick = (course: Course) => {
    setActiveCourse(course);
    setIsDeleteModalOpen(true);
  };

  const handleEditClick = (course: Course) => {
    setActiveCourse(course);
    setIsCourseModalOpen(true);
  };

  const handleCreateClick = () => {
    setActiveCourse(null);
    setIsCourseModalOpen(true);
  };

  const handleAssignClick = (course: Course) => {
    setActiveCourse(course);
    setIsAssignModalOpen(true);
  };

  const handleCourseSubmit = async (data: Partial<Course>) => {
    try {
      if (activeCourse) {
        await updateCourse(activeCourse.id, data);
        toast.success('Course updated successfully.');
      } else {
        await createCourse(data as any);
        toast.success('Course created successfully.');
      }
    } catch {
      // Handled by interceptor
    }
  };

  const confirmDelete = async () => {
    if (activeCourse) {
      try {
        await deleteCourse(activeCourse.id);
        toast.success('Course deleted successfully.');
      } catch {
        // toast handled by apiClient interceptor
      } finally {
        setIsDeleteModalOpen(false);
        setActiveCourse(null);
      }
    }
  };

  const columns = [
    { key: 'name', header: 'Course Name', render: (c: Course) => <span className="font-medium text-gray-900">{c.name}</span> },
    { key: 'date', header: 'Date', render: (c: Course) => new Date(c.date).toLocaleDateString() },
    { key: 'subject', header: 'Subject', render: (c: Course) => c.subject.join(', ') },
    {
      key: 'status', header: 'Status', render: (c: Course) => (
        <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${c.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
          c.status === 'completed' ? 'bg-green-100 text-green-800' :
            c.status === 'draft' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'
          }`}>
          {c.status.toUpperCase()}
        </span>
      )
    },
    { key: 'location', header: 'Location' },
    {
      key: 'trainer',
      header: 'Trainer',
      render: (item: Course) =>
        item.trainer ? (
          <div className="flex items-center space-x-2">
            <div>
              <div className="font-medium text-gray-900">{item.trainer.name}</div>
              <div className="text-xs text-gray-500">{item.trainer.email}</div>
            </div>
            <button
              title="Remove trainer"
              onClick={() => removeTrainer(item.id)}
              className="text-red-500 hover:text-red-700 bg-red-50 p-1 rounded-full px-2 text-xs"
            >
              Detach
            </button>
          </div>
        ) : (
          <div>
            <span className="text-gray-400 italic block mb-1">No trainer assigned</span>
            <Button size="sm" variant="secondary" onClick={() => handleAssignClick(item)}>Find Match 🤖</Button>
          </div>
        ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Course) => (
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
      <main className="container mx-auto p-6 max-w-7xl mt-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Courses Management</h1>
            <p className="text-gray-500 mt-1">Manage and view all courses.</p>
          </div>
          <Button variant="primary" onClick={handleCreateClick}>Create Course</Button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
            Failed to load courses.
          </div>
        )}

        {isLoading ? (
          <Loader />
        ) : (
          <Table columns={columns} data={courses} emptyMessage="No courses found." />
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
          Are you sure you want to delete the course <strong>{activeCourse?.name}</strong>?
        </p>
      </Modal>

      <CourseModal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        course={activeCourse}
        onSubmit={handleCourseSubmit}
      />

      {activeCourse && (
        <AssignTrainerModal
          isOpen={isAssignModalOpen}
          course={activeCourse}
          onClose={() => setIsAssignModalOpen(false)}
          onAssigned={() => mutate()}
        />
      )}
    </div>
  );
}
