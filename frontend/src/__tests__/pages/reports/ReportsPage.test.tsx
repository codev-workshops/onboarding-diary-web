import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../../../api/reports', () => ({
  reportsApi: {
    generate: jest.fn(),
    downloadCsv: jest.fn(),
  },
}));

import ReportsPage from '../../../pages/reports/ReportsPage';
import { reportsApi } from '../../../api/reports';

const mockReport = {
  dateRange: { from: '2024-01-01', to: '2024-01-31' },
  tasks: [{ id: '1', date: '2024-01-01', title: 'Task 1', category: 'coding', status: 'completed', priority: 'high' }],
  issues: [{ id: '1', date: '2024-01-01', title: 'Issue 1', severity: 'high', status: 'open' }],
  feedback: [{ id: '1', date: '2024-01-01', subject: 'FB 1', type: 'positive' }],
  notes: [{ id: '1', date: '2024-01-01', title: 'Note 1', tags: ['tag1'] }],
  summary: {},
};

function renderReports() {
  return render(
    <MemoryRouter>
      <ReportsPage />
    </MemoryRouter>
  );
}

describe('ReportsPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should render reports page', () => {
    renderReports();
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Generate Report')).toBeInTheDocument();
  });

  it('should show error when dates not selected', async () => {
    renderReports();
    fireEvent.click(screen.getByText('Generate Report'));

    await waitFor(() => {
      expect(screen.getByText('Please select date range')).toBeInTheDocument();
    });
  });

  it('should generate report', async () => {
    (reportsApi.generate as jest.Mock).mockResolvedValue({ data: { report: mockReport } });
    renderReports();

    fireEvent.change(screen.getByLabelText(/from/i), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText(/to/i), { target: { value: '2024-01-31' } });
    fireEvent.click(screen.getByText('Generate Report'));

    await waitFor(() => {
      expect(reportsApi.generate).toHaveBeenCalled();
    });
  });

  it('should show error on generate failure', async () => {
    (reportsApi.generate as jest.Mock).mockRejectedValue(new Error('fail'));
    renderReports();

    fireEvent.change(screen.getByLabelText(/from/i), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText(/to/i), { target: { value: '2024-01-31' } });
    fireEvent.click(screen.getByText('Generate Report'));

    await waitFor(() => {
      expect(screen.getByText('Failed to generate report')).toBeInTheDocument();
    });
  });
});
