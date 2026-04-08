import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../../api/tasks', () => ({
  tasksApi: {
    list: jest.fn(),
    delete: jest.fn(),
  },
}));

import TaskListPage from '../../../pages/tasks/TaskListPage';
import { tasksApi } from '../../../api/tasks';

const mockTasks = [
  { id: '1', date: '2024-01-01', title: 'Task 1', category: 'coding', status: 'completed', priority: 'high', userId: 'u1', createdAt: '', updatedAt: '' },
  { id: '2', date: '2024-01-02', title: 'Task 2', category: 'learning', status: 'in_progress', priority: 'medium', userId: 'u1', createdAt: '', updatedAt: '' },
];

function renderTaskList() {
  return render(
    <MemoryRouter>
      <TaskListPage />
    </MemoryRouter>
  );
}

describe('TaskListPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should show loading then render task list', async () => {
    (tasksApi.list as jest.Mock).mockResolvedValue({ data: { data: mockTasks, total: 2 } });
    renderTaskList();

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('Task Log')).toBeInTheDocument();
  });

  it('should show empty state', async () => {
    (tasksApi.list as jest.Mock).mockResolvedValue({ data: { data: [], total: 0 } });
    renderTaskList();

    await waitFor(() => {
      expect(screen.getByText('No tasks found')).toBeInTheDocument();
    });
  });

  it('should navigate to new task', async () => {
    (tasksApi.list as jest.Mock).mockResolvedValue({ data: { data: [], total: 0 } });
    renderTaskList();

    await waitFor(() => {
      expect(screen.getByText('New Task')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('New Task'));
    expect(mockNavigate).toHaveBeenCalledWith('/tasks/new');
  });

  it('should show error on fetch failure', async () => {
    (tasksApi.list as jest.Mock).mockRejectedValue(new Error('fail'));
    renderTaskList();

    await waitFor(() => {
      expect(screen.getByText('Failed to load tasks')).toBeInTheDocument();
    });
  });

  it('should handle delete', async () => {
    (tasksApi.list as jest.Mock).mockResolvedValue({ data: { data: mockTasks, total: 2 } });
    (tasksApi.delete as jest.Mock).mockResolvedValue({});
    renderTaskList();

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTestId('DeleteIcon');
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText('Are you sure you want to delete this task?')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(tasksApi.delete).toHaveBeenCalledWith('1');
    });
  });
});
