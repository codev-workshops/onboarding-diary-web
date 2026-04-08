import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({}),
}));

jest.mock('../../../api/tasks', () => ({
  tasksApi: {
    create: jest.fn(),
    update: jest.fn(),
    getById: jest.fn(),
  },
}));

import TaskFormPage from '../../../pages/tasks/TaskFormPage';
import { tasksApi } from '../../../api/tasks';

function renderTaskForm() {
  return render(
    <MemoryRouter>
      <TaskFormPage />
    </MemoryRouter>
  );
}

describe('TaskFormPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should render new task form', () => {
    renderTaskForm();
    expect(screen.getByText('New Task')).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it('should create task on submit', async () => {
    (tasksApi.create as jest.Mock).mockResolvedValue({});
    renderTaskForm();

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Task' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Description' } });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(tasksApi.create).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/tasks');
    });
  });

  it('should show error on create failure', async () => {
    (tasksApi.create as jest.Mock).mockRejectedValue({ response: { data: { error: { message: 'Validation error' } } } });
    renderTaskForm();

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test' } });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(screen.getByText('Validation error')).toBeInTheDocument();
    });
  });

  it('should show generic error on unknown failure', async () => {
    (tasksApi.create as jest.Mock).mockRejectedValue(new Error('fail'));
    renderTaskForm();

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test' } });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to save task')).toBeInTheDocument();
    });
  });

  it('should navigate on cancel', () => {
    renderTaskForm();
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/tasks');
  });
});
