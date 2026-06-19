import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchTaskStatus, generateVisual, regenerateVisual, resolveMediaUrl } from '../services/api';
import { statusCopy, stylePresets } from '../data/stylePresets';

const defaultStyle = stylePresets[0].id;
const POLL_INTERVAL_MS = 1000;

function isValidText(value) {
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= 1000;
}

function getStatusMessage(status) {
  return statusCopy[status] || statusCopy.pending;
}

export default function GeneratorPage() {
  const [text, setText] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(defaultStyle);
  const [status, setStatus] = useState('pending');
  const [statusError, setStatusError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [formError, setFormError] = useState('');
  const pollRef = useRef(null);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [regenerateText, setRegenerateText] = useState('');

  useEffect(() => {
    return () => {
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
      }
    };
  }, []);

  const stopPolling = () => {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const startPolling = (nextTaskId) => {
    stopPolling();
    const pollTask = async () => {
      try {
        const task = await fetchTaskStatus(nextTaskId);
        setStatus(task.status);

        if (task.status === 'completed') {
          setResult(task);
          setStatusError('');
          setIsGenerating(false);
          stopPolling();
          return;
        }

        if (task.status === 'failed') {
          setStatusError(task.errorMessage || 'Generation failed.');
          setIsGenerating(false);
          stopPolling();
        }
      } catch (error) {
        setStatusError(error.message);
        setIsGenerating(false);
        stopPolling();
      }
    };

    pollTask();
    pollRef.current = window.setInterval(pollTask, POLL_INTERVAL_MS);
  };

  const generateImage = async (promptText) => {
    try {
      setIsGenerating(true);
      setStatus('pending');
      setStatusError('');
      setResult(null);

      const response = await generateVisual({
        text: promptText.trim(),
        style: selectedStyle
      });

      setStatus(response.status || 'pending');
      startPolling(response.taskId);
    } catch (error) {
      setIsGenerating(false);
      setStatus('failed');
      setStatusError(error.message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError('');

    if (!isValidText(text)) {
      setFormError(
        'Paste between 1 and 1,000 characters of curriculum text.'
      );
      return;
    }

    generateImage(text);
  };

  const handleOpenRegenerate = () => {
    setRegenerateText(result?.curriculumText || text);
    setShowRegenerateModal(true);
  };

  const regenerateImage = async (promptText, taskId) => {
    try {
      setIsGenerating(true);
      setStatus('pending');
      setStatusError('');
      setResult(null);

      const response = await regenerateVisual(taskId, promptText);

      setStatus(response.status || 'pending');
      startPolling(response.taskId);
    } catch (error) {
      setIsGenerating(false);
      setStatus('failed');
      setStatusError(error.message);
    }
  };

  const handleConfirmRegenerate = async () => {
    if (!isValidText(regenerateText)) {
      return;
    }

    setText(regenerateText);
    setShowRegenerateModal(false);

    await regenerateImage(regenerateText, result.id);
  };

  const charCount = text.length;
  const statusMessage = getStatusMessage(status);

  return (
    <div className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="font-display-lg text-display-lg text-on-surface mb-4">Create Your Visual Aid</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Turn complex curriculum text into engaging visual resources for your classroom in seconds.
          </p>
        </div>

        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 mb-8 shadow-sm">
          <form onSubmit={handleSubmit}>
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <label className="font-headline-sm text-headline-sm text-on-surface" htmlFor="curriculum-text">
                  Curriculum Context
                </label>
                <span
                  className={`font-label-sm text-label-sm ${charCount > 900 ? 'text-error' : 'text-on-surface-variant'}`}
                >
                  {charCount} / 1000 characters
                </span>
              </div>
              <textarea
                id="curriculum-text"
                value={text}
                onChange={(event) => setText(event.target.value)}
                maxLength={1000}
                placeholder="Describe the visual you need for today's lesson... (e.g., The process of photosynthesis in a temperate forest ecosystem, focusing on the chloroplast functions.)"
                className="w-full h-48 p-4 rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary-container bg-surface text-body-md resize-none transition-all"
              />
              <div className="mt-4 flex items-start gap-3 p-4 bg-tertiary-fixed rounded-lg border border-tertiary-container/20">
                <span
                  className="material-symbols-outlined text-on-tertiary-fixed-variant"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  lightbulb
                </span>
                <p className="font-label-md text-label-md text-on-tertiary-fixed-variant">
                  <span className="font-bold">Pro-tip:</span> Detailed descriptions of key concepts lead to more accurate
                  diagrams and illustrations.
                </p>
              </div>
            </div>

            {formError && (
              <p className="mb-4 p-4 bg-error-container text-on-error-container rounded-lg font-label-md">{formError}</p>
            )}

            <div className="mb-12">
              <h2 className="font-headline-sm text-headline-sm text-on-surface mb-6">Choose a Visual Style</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stylePresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedStyle(preset.id)}
                    aria-pressed={selectedStyle === preset.id}
                    className={`style-option flex flex-col text-left group bg-surface border rounded-xl overflow-hidden hover:border-primary transition-all duration-300 ${selectedStyle === preset.id ? 'style-card-active' : 'border-outline-variant'
                      }`}
                  >
                    <div className="h-32 w-full overflow-hidden">
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src={preset.image}
                        alt={preset.title}
                      />
                    </div>
                    <div className="p-4">
                      <span className={`font-label-md text-label-md ${preset.badgeClass} block mb-1`}>{preset.badge}</span>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface">{preset.title}</h3>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center mb-8">
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full md:w-auto px-12 py-4 bg-primary text-on-primary rounded-full font-headline-sm text-headline-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined">auto_awesome</span>
                {isGenerating ? 'Generating…' : 'Generate Visual Aid'}
              </button>
            </div>
          </form>

          {isGenerating && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-surface-container border border-outline-variant rounded-xl p-6 relative overflow-hidden">
              <div className="absolute bottom-0 left-0 h-1 w-full bg-surface-container-high">
                <div className="loading-bar-active absolute top-0 left-0 h-full bg-secondary rounded-full" />
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
                  <span className="material-symbols-outlined animate-spin" style={{ animationDuration: '3s' }}>
                    sync
                  </span>
                </div>
                <div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface">{statusMessage.title}</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant">{statusMessage.description}</p>
                </div>
              </div>
            </div>
          )}

          {statusError && (
            <div className="mt-4 bg-error-container border border-error rounded-xl p-6">
              <p className="font-label-md text-on-error-container">{statusError}</p>
            </div>
          )}

          {result && (
            <div className="mt-4 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
              <div className="aspect-video bg-surface-container-high">
                <img src={resolveMediaUrl(result.imageUrl)} alt="Generated visual" className="w-full h-full object-cover" />
              </div>
              <div className="p-6">
                <p className="font-label-md text-on-surface-variant mb-2">Generated Result</p>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Saved to your gallery</h3>
                <p className="font-body-md text-on-surface-variant mb-6">{result.curriculumText || text}</p>
                <div className="flex gap-3">
                  <Link
                    to="/gallery"
                    className="flex-1 py-3 px-4 flex items-center justify-center gap-2 bg-primary text-on-primary font-label-md rounded-lg hover:opacity-90 transition-all"
                  >
                    <span className="material-symbols-outlined">collections</span>
                    Open Gallery
                  </Link>
                  <a
                    href={resolveMediaUrl(result.imageUrl)}
                    download
                    className="flex-1 py-3 px-4 flex items-center justify-center gap-2 bg-surface-container-high text-primary font-label-md border border-primary/20 rounded-lg hover:bg-primary hover:text-on-primary transition-all"
                  >
                    <span className="material-symbols-outlined">download</span>
                    Download
                  </a>
                  <button
                    type="button"
                    onClick={handleOpenRegenerate}
                    className="flex-1 py-3 px-4 flex items-center justify-center gap-2 bg-primary text-on-primary font-label-md rounded-lg hover:opacity-90 transition-all"
                  >
                    <span className="material-symbols-outlined">
                      refresh
                    </span>
                    Regenerate
                  </button>
                </div>
              </div>
            </div>
          )}

          {showRegenerateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-2xl bg-surface-container-lowest rounded-3xl border border-outline-variant shadow-xl">
                <div className="p-8">
                  <h2 className="font-headline-md text-on-surface mb-6">
                    Curriculum Context
                  </h2>

                  <textarea
                    value={regenerateText}
                    onChange={(e) => setRegenerateText(e.target.value)}
                    maxLength={1000}
                    className="w-full h-48 p-4 rounded-2xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary-container resize-none"
                  />

                  <div className="flex gap-4 mt-8">
                    <button
                      type="button"
                      onClick={handleConfirmRegenerate}
                      className="flex-1 py-4 rounded-2xl bg-primary text-on-primary font-medium"
                    >
                      Confirm Regeneration
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowRegenerateModal(false)}
                      className="flex-1 py-4 rounded-2xl bg-surface-container-high text-on-surface"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
