import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DataProvider } from './DataContext';
import { DataStatusBoundary } from '../App';

const validNational = 'week_start_date,week_end_date,epi_year,epi_week,suspected_cases,confirmed_cases,probable_cases,deaths\n2024-01-01,2024-01-07,2024,1,10,2,0,1';
const response = (body, ok = true, status = 200, json = undefined) => ({ ok, status, text: async () => body, json: json || (async () => JSON.parse(body)) });

function Screen() {
  return <DataStatusBoundary><div>Loaded dashboard</div></DataStatusBoundary>;
}
function renderWithProvider() { return render(<DataProvider><Screen /></DataProvider>); }

describe('shared data status boundary', () => {
  afterEach(() => { cleanup(); vi.restoreAllMocks(); });

  it('shows loading before requests resolve', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
    renderWithProvider();
    expect(screen.getByRole('status')).toHaveTextContent('Loading surveillance data');
  });

  it.each([404, 500])('shows an accessible HTTP %s error', async (status) => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(response('', false, status))));
    renderWithProvider();
    expect(await screen.findByRole('alert')).toHaveTextContent(`HTTP ${status}`);
  });

  it('shows an error for malformed CSV', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(response('week_start_date,week_end_date\n"broken', true)));
    renderWithProvider();
    expect(await screen.findByRole('alert')).toHaveTextContent('could not be parsed');
  });

  it('shows an error for malformed JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(response(validNational)).mockResolvedValueOnce({ ok: true, status: 200, text: async () => '', json: async () => { throw new SyntaxError('bad json'); } }));
    renderWithProvider();
    expect(await screen.findByRole('alert')).toHaveTextContent('bad json');
  });

  it('shows empty for empty national or state datasets', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(response('week_start_date,week_end_date,epi_year,epi_week,suspected_cases,confirmed_cases,probable_cases,deaths\n')));
    renderWithProvider();
    expect(await screen.findByRole('status')).toHaveTextContent('No surveillance observations');
    cleanup(); vi.restoreAllMocks();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(response(validNational)).mockResolvedValueOnce(response(JSON.stringify([]))));
    renderWithProvider();
    expect((await screen.findAllByRole('status')).at(-1)).toHaveTextContent('No surveillance observations');
  });
});
