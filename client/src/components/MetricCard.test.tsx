import React from 'react';
import { render, screen } from '@testing-library/react';
import MetricCard from './MetricCard';
import { DollarSign } from 'lucide-react';

describe('MetricCard', () => {
  it('renders correctly with title, value, and icon', () => {
    render(
      <MetricCard
        title="Total Revenue"
        value="$10,000"
        icon={<DollarSign data-testid="dollar-icon" />}
      />
    );

    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('$10,000')).toBeInTheDocument();
    expect(screen.getByTestId('dollar-icon')).toBeInTheDocument();
  });

  it('renders with a link if provided', () => {
    render(
      <MetricCard
        title="Sales Items"
        value="View All"
        icon={<DollarSign data-testid="dollar-icon" />}
        link="/sales"
      />
    );

    const linkElement = screen.getByRole('link', { name: /view all/i });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', '/sales');
  });
});