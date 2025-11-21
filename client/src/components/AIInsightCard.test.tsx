import React from 'react';
import { render, screen } from '@testing-library/react';
import AIInsightCard from './AIInsightCard';

describe('AIInsightCard', () => {
  it('renders title and description correctly', () => {
    const title = 'Test Insight';
    const description = 'This is a test description for the AI insight.';
    render(<AIInsightCard title={title} description={description} />);

    expect(screen.getByTestId(`text-insight-title-${title.toLowerCase().replace(/\s+/g, "-")}`)).toHaveTextContent(title);
    expect(screen.getByTestId(`text-insight-description-${title.toLowerCase().replace(/\s+/g, "-")}`)).toHaveTextContent(description);
    expect(screen.queryByText(/%$/)).not.toBeInTheDocument(); // Ensure confidence is not rendered
  });

  it('renders confidence score when provided', () => {
    const title = 'Confident Insight';
    const description = 'This insight has a high confidence.';
    const confidence = 85;
    render(<AIInsightCard title={title} description={description} confidence={confidence} />);

    expect(screen.getByTestId(`text-insight-title-${title.toLowerCase().replace(/\s+/g, "-")}`)).toHaveTextContent(title);
    expect(screen.getByTestId(`text-insight-description-${title.toLowerCase().replace(/\s+/g, "-")}`)).toHaveTextContent(description);
    expect(screen.getByText(`${confidence}%`)).toBeInTheDocument();
    expect(screen.getByTestId(`card-ai-insight-${title.toLowerCase().replace(/\s+/g, "-")}`)).toBeInTheDocument();
  });
});
