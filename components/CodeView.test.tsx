/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CodeView } from './CodeView';

describe('CodeView Component', () => {
  it('should render the code passed as a prop', () => {
    // Arrange: Define the code to be rendered
    const testCode = 'print("Hello, World!")';

    // Act: Render the component with the test code
    render(<CodeView code={testCode} />);

    // Assert: Check if the code is visible in the document
    // We expect to find an element containing the text content of our test code.
    const codeElement = screen.getByText(testCode);
    expect(codeElement).toBeInTheDocument();
  });

  it('should have a copy button', () => {
    // Arrange
    render(<CodeView code={"some code"} />);

    // Act
    const copyButton = screen.getByRole('button', { name: /copy/i });

    // Assert
    expect(copyButton).toBeInTheDocument();
  });
});
