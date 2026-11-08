import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Sidebar from './Sidebar';

describe('responsive navigation drawer', () => {
  afterEach(() => cleanup());

  it('closes when Escape is pressed while the drawer is open', () => {
    const onClose = vi.fn();
    render(<Sidebar activeTab="overview" setActiveTab={vi.fn()} isOpen onClose={onClose} />);

    expect(screen.getByRole('complementary', { name: 'Primary navigation' })).toHaveClass('is-open');
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('selects a destination and closes the drawer', () => {
    const setActiveTab = vi.fn();
    const onClose = vi.fn();
    render(<Sidebar activeTab="overview" setActiveTab={setActiveTab} isOpen onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'Spatial Analysis' }));

    expect(setActiveTab).toHaveBeenCalledWith('spatial');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
