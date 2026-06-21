import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '../src/pages/HomePage';
import GeneratorPage from '../src/pages/GeneratorPage';
import GalleryPage from '../src/pages/GalleryPage';
import AppLayout from '../src/components/layout/AppLayout';

vi.mock('../src/services/api', () => ({
  generateVisual: vi.fn(),
  fetchTaskStatus: vi.fn(),
  fetchGallery: vi.fn(),
  regenerateVisual: vi.fn(),
  resolveMediaUrl: vi.fn((value) => value),
}));

import { fetchGallery, fetchTaskStatus, generateVisual, regenerateVisual } from '../src/services/api';

function renderWithRouter(path, element) {
  return render(
    <MemoryRouter
      initialEntries={[path]}
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AppLayout>{element}</AppLayout>
    </MemoryRouter>
  );
}

describe('frontend pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it('renders the landing page hero and showcase sections', () => {
    renderWithRouter('/', <HomePage />);

    expect(screen.getByText(/Turn Curriculum Text into Classroom Visuals/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Go to Generator/i })).toHaveAttribute('href', '/generator');
    expect(screen.getByRole('link', { name: /View Showcase/i })).toHaveAttribute('href', '/gallery');
    expect(screen.getByRole('heading', { name: /Built for Every Subject/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Start Generating Now/i })).toHaveAttribute('href', '/generator');
  });

  it('navigates to generator and gallery from the header', () => {
    renderWithRouter('/', <HomePage />);

    const navigation = screen.getByRole('navigation');
    expect(within(navigation).getByRole('link', { name: /^Generator$/i })).toHaveAttribute('href', '/generator');
    expect(within(navigation).getByRole('link', { name: /^Gallery$/i })).toHaveAttribute('href', '/gallery');
  });

  it('submits a generation request and shows the backend task result', async () => {
    generateVisual.mockResolvedValueOnce({ taskId: 'task-1', status: 'pending' });
    fetchTaskStatus.mockResolvedValueOnce({
      status: 'completed',
      imageUrl: '/uploads/result.png',
      curriculumText: 'Water cycle lesson',
    });

    renderWithRouter('/generator', <GeneratorPage />);

    fireEvent.change(screen.getByLabelText(/Curriculum Context/i), {
      target: { value: 'Water cycle lesson' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Edu-Cartoon/i }));
    fireEvent.click(screen.getByRole('button', { name: /Generate Visual Aid/i }));

    await waitFor(() =>
      expect(generateVisual).toHaveBeenCalledWith({ text: 'Water cycle lesson', style: 'Edu-Cartoon' })
    );

    await waitFor(() => expect(screen.getByText(/Saved to your gallery/i)).toBeInTheDocument());
    expect(screen.getByRole('link', { name: /Open Gallery/i })).toHaveAttribute('href', '/gallery');
  });

  it('renders the gallery data returned from the backend', async () => {
    fetchGallery.mockResolvedValueOnce([
      {
        id: '1',
        title: 'Photosynthesis Diagram',
        imageUrl: '/uploads/image.png',
        style: 'Technical Diagram',
        originalText: 'Photosynthesis',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ]);

    renderWithRouter('/gallery', <GalleryPage />);

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /Photosynthesis Diagram/i })).toBeInTheDocument()
    );
    expect(screen.getByText('Photosynthesis', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /New Aid/i })).toHaveAttribute('href', '/generator');
    expect(screen.getByRole('link', { name: /Create new visual aid/i })).toHaveAttribute('href', '/generator');
  });

  it('filters gallery items by search query', async () => {
    fetchGallery.mockResolvedValueOnce([
      {
        id: '1',
        title: 'Water Cycle',
        imageUrl: '/uploads/water.png',
        style: 'Edu-Cartoon',
        originalText: 'Evaporation and condensation',
        createdAt: '2026-06-19T10:00:00.000Z',
      },
      {
        id: '2',
        title: 'Roman Empire',
        imageUrl: '/uploads/history.png',
        style: 'Historical Sketch',
        originalText: 'Expansion of Rome',
        createdAt: '2026-06-18T10:00:00.000Z',
      },
    ]);

    renderWithRouter('/gallery', <GalleryPage />);

    await waitFor(() => expect(screen.getByRole('heading', { name: /Water Cycle/i })).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText(/Search by curriculum topic/i), {
      target: { value: 'Roman' },
    });

    expect(screen.queryByRole('heading', { name: /Water Cycle/i })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Roman Empire/i })).toBeInTheDocument();
  });

  it('renders version history and supports switching between versions', async () => {
    const mockData = [
      {
        id: '2',
        title: 'Version 2 Title',
        imageUrl: '/uploads/version2.png',
        style: 'Edu-Cartoon',
        originalText: 'Version 2 Text',
        parentId: '1',
        createdAt: '2026-06-19T11:00:00.000Z',
      },
      {
        id: '1',
        title: 'Version 1 Title',
        imageUrl: '/uploads/version1.png',
        style: 'Edu-Cartoon',
        originalText: 'Version 1 Text',
        parentId: null,
        createdAt: '2026-06-19T10:00:00.000Z',
      },
    ];
    fetchGallery.mockImplementation(async () => mockData);

    renderWithRouter('/gallery', <GalleryPage />);

    // By default, version 2 (latest) should be displayed
    await waitFor(() => expect(screen.getByRole('heading', { name: /Version 2 Title/i })).toBeInTheDocument());
    expect(screen.getByText('Version 2 Text', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByAltText('Version 2 Title')).toHaveAttribute('src', '/uploads/version2.png');

    // Click version 1 thumbnail to switch version
    const v1Btn = screen.getByTitle(/Switch to Version 1/i);
    fireEvent.click(v1Btn);

    // Now, version 1 should be displayed
    expect(screen.getByRole('heading', { name: /Version 1 Title/i })).toBeInTheDocument();
    expect(screen.getByText('Version 1 Text', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByAltText('Version 1 Title')).toHaveAttribute('src', '/uploads/version1.png');
  });

  it('submits inline regeneration request with modified curriculum text', async () => {
    let galleryData = [
      {
        id: '1',
        title: 'Cell Organelles',
        imageUrl: '/uploads/cell.png',
        style: 'Edu-Cartoon',
        originalText: 'Eukaryotic cells',
        parentId: null,
        createdAt: '2026-06-19T10:00:00.000Z',
      },
    ];
    fetchGallery.mockImplementation(async () => galleryData);

    regenerateVisual.mockResolvedValueOnce({ taskId: 'task-new', status: 'pending' });
    fetchTaskStatus.mockResolvedValueOnce({
      id: '2',
      status: 'completed',
      imageUrl: '/uploads/cell-updated.png',
      curriculumText: 'Eukaryotic cells with nucleus',
      parentId: '1',
    });

    renderWithRouter('/gallery', <GalleryPage />);

    await waitFor(() => expect(screen.getByRole('heading', { name: /Cell Organelles/i })).toBeInTheDocument());

    // Update the mock data that fetchGallery will return AFTER regeneration
    galleryData = [
      {
        id: '2',
        title: 'Cell Organelles',
        imageUrl: '/uploads/cell-updated.png',
        style: 'Edu-Cartoon',
        originalText: 'Eukaryotic cells with nucleus',
        parentId: '1',
        createdAt: '2026-06-19T11:00:00.000Z',
      },
      {
        id: '1',
        title: 'Cell Organelles',
        imageUrl: '/uploads/cell.png',
        style: 'Edu-Cartoon',
        originalText: 'Eukaryotic cells',
        parentId: null,
        createdAt: '2026-06-19T10:00:00.000Z',
      },
    ];

    // Click Regenerate to open inline form
    fireEvent.click(screen.getByRole('button', { name: /Regenerate/i }));

    // Modify curriculum context textarea
    const textarea = screen.getByLabelText(/Curriculum Context/i);
    fireEvent.change(textarea, { target: { value: 'Eukaryotic cells with nucleus' } });

    // Click Confirm Regeneration
    fireEvent.click(screen.getByRole('button', { name: /Confirm Regeneration/i }));

    await waitFor(() =>
      expect(regenerateVisual).toHaveBeenCalledWith('1', 'Eukaryotic cells with nucleus')
    );
    await waitFor(() =>
      expect(screen.getByAltText('Cell Organelles')).toHaveAttribute('src', '/uploads/cell-updated.png')
    );
  });
});
