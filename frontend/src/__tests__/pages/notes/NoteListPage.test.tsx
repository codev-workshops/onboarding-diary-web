import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../../api/notes', () => ({
  notesApi: {
    list: jest.fn(),
    delete: jest.fn(),
  },
}));

import NoteListPage from '../../../pages/notes/NoteListPage';
import { notesApi } from '../../../api/notes';

const mockNotes = [
  { id: '1', date: '2024-01-01', title: 'Note 1', content: 'Content', tags: ['tag1', 'tag2'], userId: 'u1', createdAt: '', updatedAt: '' },
  { id: '2', date: '2024-01-02', title: 'Note 2', content: 'Content', tags: [], userId: 'u1', createdAt: '', updatedAt: '' },
];

function renderNoteList() {
  return render(
    <MemoryRouter>
      <NoteListPage />
    </MemoryRouter>
  );
}

describe('NoteListPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should render note list', async () => {
    (notesApi.list as jest.Mock).mockResolvedValue({ data: { data: mockNotes, total: 2 } });
    renderNoteList();

    await waitFor(() => {
      expect(screen.getByText('Note 1')).toBeInTheDocument();
    });
    expect(screen.getByText('Note 2')).toBeInTheDocument();
    expect(screen.getByText('Additional Notes')).toBeInTheDocument();
  });

  it('should show empty state', async () => {
    (notesApi.list as jest.Mock).mockResolvedValue({ data: { data: [], total: 0 } });
    renderNoteList();

    await waitFor(() => {
      expect(screen.getByText('No notes found')).toBeInTheDocument();
    });
  });

  it('should navigate to new note', async () => {
    (notesApi.list as jest.Mock).mockResolvedValue({ data: { data: [], total: 0 } });
    renderNoteList();

    await waitFor(() => {
      expect(screen.getByText('New Note')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('New Note'));
    expect(mockNavigate).toHaveBeenCalledWith('/notes/new');
  });

  it('should show error on failure', async () => {
    (notesApi.list as jest.Mock).mockRejectedValue(new Error('fail'));
    renderNoteList();

    await waitFor(() => {
      expect(screen.getByText('Failed to load notes')).toBeInTheDocument();
    });
  });

  it('should render tags', async () => {
    (notesApi.list as jest.Mock).mockResolvedValue({ data: { data: mockNotes, total: 2 } });
    renderNoteList();

    await waitFor(() => {
      expect(screen.getByText('tag1')).toBeInTheDocument();
      expect(screen.getByText('tag2')).toBeInTheDocument();
    });
  });

  it('should handle delete', async () => {
    (notesApi.list as jest.Mock).mockResolvedValue({ data: { data: mockNotes, total: 2 } });
    (notesApi.delete as jest.Mock).mockResolvedValue({});
    renderNoteList();

    await waitFor(() => {
      expect(screen.getByText('Note 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTestId('DeleteIcon');
    fireEvent.click(deleteButtons[0]);
    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(notesApi.delete).toHaveBeenCalledWith('1');
    });
  });
});
