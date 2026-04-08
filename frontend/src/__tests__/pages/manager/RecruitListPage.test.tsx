import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../../api/manager', () => ({
  managerApi: {
    listRecruits: jest.fn(),
  },
}));

import RecruitListPage from '../../../pages/manager/RecruitListPage';
import { managerApi } from '../../../api/manager';

const mockRecruits = [
  { id: '1', name: 'Recruit 1', email: 'r1@test.com', department: 'Eng', startDate: '2024-01-01', isActive: true, role: 'recruit', createdAt: '' },
  { id: '2', name: 'Recruit 2', email: 'r2@test.com', department: '', startDate: '', isActive: false, role: 'recruit', createdAt: '' },
];

function renderRecruitList() {
  return render(
    <MemoryRouter>
      <RecruitListPage />
    </MemoryRouter>
  );
}

describe('RecruitListPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should show loading then render recruit list', async () => {
    (managerApi.listRecruits as jest.Mock).mockResolvedValue({ data: { recruits: mockRecruits } });
    renderRecruitList();

    await waitFor(() => {
      expect(screen.getByText('Recruit 1')).toBeInTheDocument();
    });
    expect(screen.getByText('Recruit 2')).toBeInTheDocument();
    expect(screen.getByText('My Recruits')).toBeInTheDocument();
  });

  it('should show empty state', async () => {
    (managerApi.listRecruits as jest.Mock).mockResolvedValue({ data: { recruits: [] } });
    renderRecruitList();

    await waitFor(() => {
      expect(screen.getByText('No recruits assigned')).toBeInTheDocument();
    });
  });

  it('should show error on failure', async () => {
    (managerApi.listRecruits as jest.Mock).mockRejectedValue(new Error('fail'));
    renderRecruitList();

    await waitFor(() => {
      expect(screen.getByText('Failed to load recruits')).toBeInTheDocument();
    });
  });

  it('should navigate to recruit detail', async () => {
    (managerApi.listRecruits as jest.Mock).mockResolvedValue({ data: { recruits: mockRecruits } });
    renderRecruitList();

    await waitFor(() => {
      expect(screen.getByText('Recruit 1')).toBeInTheDocument();
    });

    const viewButtons = screen.getAllByTestId('VisibilityIcon');
    fireEvent.click(viewButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/manager/recruits/1');
  });
});
