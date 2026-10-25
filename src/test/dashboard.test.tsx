import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('CloudCost Lens Dashboard Integration', () => {
  it('renders dashboard with initial sample data and accurate metrics', () => {
    render(<App />);

    // Brand header
    expect(screen.getByText('CloudCost Lens')).toBeInTheDocument();

    // Overview cards
    expect(screen.getByText('Total Observed Cost')).toBeInTheDocument();
    expect(screen.getByText('Budget Utilization')).toBeInTheDocument();
    expect(screen.getByText('Period Spending Change')).toBeInTheDocument();

    // Ranked Service Table
    expect(screen.getByText('Service Expenditure Breakdown')).toBeInTheDocument();
    expect(screen.getAllByText('Amazon EC2').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Amazon S3').length).toBeGreaterThan(0);

    // Analytics Panels
    expect(screen.getByText(/Statistical Anomaly Detection/i)).toBeInTheDocument();
    expect(screen.getByText(/End-of-Month Cost Projections/i)).toBeInTheDocument();
    expect(screen.getByText(/Prioritized Optimization Opportunities/i)).toBeInTheDocument();
  });

  it('filters by service when dropdown is changed', () => {
    render(<App />);

    const serviceSelect = screen.getByDisplayValue(/All Services/i);
    expect(serviceSelect).toBeInTheDocument();

    // Select Amazon S3 only
    fireEvent.change(serviceSelect, { target: { value: 'Amazon S3' } });

    // Table and cards should now reflect Amazon S3
    expect(screen.getAllByText('Amazon S3').length).toBeGreaterThan(0);
  });

  it('allows switching to secondary GCP dataset seamlessly', () => {
    render(<App />);

    const gcpButton = screen.getByTitle('Load secondary Google Cloud dataset');
    fireEvent.click(gcpButton);

    // Should now show GCP services
    expect(screen.getAllByText('Google Compute Engine').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Cloud Storage').length).toBeGreaterThan(0);
  });

  it('opens and closes the AI Briefing modal', () => {
    render(<App />);

    const aiButton = screen.getByTitle('Generate AI executive briefing');
    fireEvent.click(aiButton);

    // Modal should be visible
    expect(screen.getByText('Gemma / Gemini FinOps AI Briefing')).toBeInTheDocument();
    expect(screen.getByText(/Strict FinOps Data Privacy Protocol/i)).toBeInTheDocument();

    // Close modal
    const closeBtn = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeBtn);

    expect(screen.queryByText('Gemma / Gemini FinOps AI Briefing')).not.toBeInTheDocument();
  });
});
