import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({}),
}));

jest.mock('../../../api/notes', () => ({
  notesApi: {
    create: jest.fn(),
    update: jest.fn(),
    getById: jest.fn(),
  },
}));

import NoteFormPage from '../../../pages/notes/NoteFormPage';
import { notesApi } from '../../../api/notes';

function renderNoteForm() {
  return render(
    <MemoryRouter>
      <NoteFormPage />
    </MemoryRouter>
  );
}

describe('NoteFormPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should render new note form', () => {
    renderNoteForm();
    expect(screen.getByText('New Note')).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/content/i)).toBeInTheDocument();
  });

  it('should create note on submit', async () => {
    (notesApi.create as jest.Mock).mockResolvedValue({});
    renderNoteForm();

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'My Note' } });
    fireEvent.change(screen.getByLabelText(/content/i), { target: { value: 'Note content here' } });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(notesApi.create).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/notes');
    });
  });

  it('should show error on failure', async () => {
    (notesApi.create as jest.Mock).mockRejectedValue(new Error('fail'));
    renderNoteForm();

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/content/i), { target: { value: 'Content' } });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to save note')).toBeInTheDocument();
    });
  });

  it('should add and remove tags', () => {
    renderNoteForm();
    const tagInput = screen.getByLabelText(/add tag/i);
    fireEvent.change(tagInput, { target: { value: 'react' } });
    fireEvent.click(screen.getByRole('button', { name: /add/i }));

    expect(screen.getByText('react')).toBeInTheDocument();
  });

  it('should navigate on cancel', () => {
    renderNoteForm();
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/notes');
  });
});
