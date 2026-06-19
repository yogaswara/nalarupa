import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchGallery, fetchTaskStatus, regenerateVisual, resolveMediaUrl } from '../services/api';

const REGENERATION_POLL_INTERVAL_MS = 1000;
const REGENERATION_TIMEOUT_MS = 30000;

function formatRelativeTime(value) {
  if (!value) {
    return 'Recently created';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Recently created';
  }

  const diffMs = Date.now() - parsed.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) {
    return 'Just now';
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}

function LoadingPlaceholder() {
  return (
    <div className="rounded-xl overflow-hidden flex flex-col animate-pulse bg-white border border-outline-variant">
      <div className="aspect-[4/3] loading-shimmer" />
      <div className="p-5 space-y-4">
        <div className="h-6 w-3/4 loading-shimmer rounded" />
        <div className="h-12 w-full loading-shimmer rounded" />
        <div className="flex gap-2">
          <div className="h-10 flex-1 loading-shimmer rounded" />
          <div className="h-10 flex-1 loading-shimmer rounded" />
        </div>
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const [galleryItems, setGalleryItems] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [regenerationError, setRegenerationError] = useState('');
  const [regeneratingItemId, setRegeneratingItemId] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedVersionMap, setSelectedVersionMap] = useState({});
  const [activeRegenGroupId, setActiveRegenGroupId] = useState(null);
  const [regenTextMap, setRegenTextMap] = useState({});

  console.log('DEBUG: galleryItems is:', galleryItems);

  useEffect(() => {
    let cancelled = false;

    async function loadGallery() {
      try {
        setLoading(true);
        setError('');
        const items = await fetchGallery();
        if (!cancelled) {
          setGalleryItems(items);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadGallery();
    return () => {
      cancelled = true;
    };
  }, []);

  // Group the gallery items by root ID (parentId || id)
  const groupedItems = useMemo(() => {
    const groups = {};

    galleryItems.forEach((item) => {
      const rootId = item.parentId || item.id;
      if (!groups[rootId]) {
        groups[rootId] = [];
      }
      groups[rootId].push(item);
    });

    const groupsList = Object.keys(groups).map((rootId) => {
      // Sort items by createdAt descending (latest version first)
      const items = groups[rootId].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return {
        rootId,
        items,
        latest: items[0],
      };
    });

    // Sort groups by the latest item's createdAt descending
    return groupsList.sort((a, b) => new Date(b.latest.createdAt) - new Date(a.latest.createdAt));
  }, [galleryItems]);

  const filteredGroups = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return groupedItems;
    }

    return groupedItems.filter((group) => {
      return group.items.some((item) => {
        const haystack = [item.title, item.style, item.originalText, item.curriculumText]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(normalized);
      });
    });
  }, [groupedItems, query]);

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    window.setTimeout(() => {
      setIsLoadingMore(false);
    }, 1500);
  };

  const waitForRegeneratedTask = async (taskId) => {
    const deadline = Date.now() + REGENERATION_TIMEOUT_MS;

    while (Date.now() < deadline) {
      const task = await fetchTaskStatus(taskId);
      if (task.status === 'completed') {
        return task;
      }
      if (task.status === 'failed') {
        throw new Error(task.errorMessage || 'Regeneration failed.');
      }
      await new Promise((resolve) => {
        window.setTimeout(resolve, REGENERATION_POLL_INTERVAL_MS);
      });
    }

    throw new Error('Regeneration is taking longer than expected. Check the gallery again shortly.');
  };

  const handleRegenerate = async (item, text) => {
    try {
      setRegenerationError('');
      setRegeneratingItemId(item.id);
      const response = await regenerateVisual(item.id, text);
      const completedTask = await waitForRegeneratedTask(response.taskId);
      const items = await fetchGallery();
      setGalleryItems(items);
      
      // Auto-select the newly generated version
      setSelectedVersionMap((prev) => ({
        ...prev,
        [item.parentId || item.id]: completedTask.id,
      }));
      setActiveRegenGroupId(null);
    } catch (requestError) {
      setRegenerationError(requestError.message);
    } finally {
      setRegeneratingItemId('');
    }
  };

  return (
    <>
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
        <div className="mb-10">
          <h1 className="font-headline-md text-display-lg text-on-surface mb-2">Resource Gallery</h1>
          <p className="text-on-surface-variant font-body-lg max-w-2xl">
            Browse your previous curriculum-aligned visual aids. Review, edit, and export them directly to your lesson
            materials.
          </p>
        </div>

        <section className="mb-12">
          <div
            className={`flex flex-col md:flex-row gap-4 items-center bg-surface-container-low p-4 rounded-xl border border-outline-variant shadow-sm transition-all ${
              searchFocused ? 'ring-2 ring-primary-fixed-dim' : ''
            }`}
          >
            <div className="relative flex-1 w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-body-md"
                placeholder="Search by curriculum topic or visual style..."
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg hover:bg-surface-container transition-colors text-label-md"
              >
                <span className="material-symbols-outlined text-sm">filter_list</span>
                Style
              </button>
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg hover:bg-surface-container transition-colors text-label-md"
              >
                <span className="material-symbols-outlined text-sm">calendar_today</span>
                Date
              </button>
              <Link
                to="/generator"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-all text-label-md whitespace-nowrap shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                New Aid
              </Link>
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-4 p-4 bg-error-container text-on-error-container rounded-lg font-label-md">{error}</div>
        )}

        {regenerationError && (
          <div className="mb-4 p-4 bg-error-container text-on-error-container rounded-lg font-label-md">
            {regenerationError}
          </div>
        )}

        {loading ? (
          <div className="gallery-grid" aria-label="Loading gallery">
            <LoadingPlaceholder />
            <LoadingPlaceholder />
          </div>
        ) : filteredGroups.length > 0 ? (
          <>
            <div className="gallery-grid">
              {filteredGroups.map((group) => {
                const totalVersions = group.items.length;
                const selectedItemId = selectedVersionMap[group.rootId] || group.latest.id;
                const selectedItem = group.items.find((it) => it.id === selectedItemId) || group.latest;
                const isRegeneratingThisGroup = group.items.some((it) => it.id === regeneratingItemId);

                return (
                  <div key={group.rootId} className="glass-card rounded-xl overflow-hidden flex flex-col group/card">
                    <div className="relative aspect-[4/3] overflow-hidden bg-surface-container-low">
                      <img
                        className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                        src={resolveMediaUrl(selectedItem.imageUrl)}
                        alt={selectedItem.title || selectedItem.curriculumText || selectedItem.originalText || 'Generated visual'}
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 rounded bg-secondary-container text-on-secondary-container text-label-sm font-bold shadow-sm">
                          {selectedItem.style || 'Generated'}
                        </span>
                      </div>
                      {isRegeneratingThisGroup && (
                        <div className="absolute bottom-0 left-0 h-1 w-full bg-surface-container-high">
                          <div className="loading-bar-active absolute top-0 left-0 h-full bg-secondary rounded-full" />
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center min-w-0">
                          <h3 className="font-headline-sm text-on-surface line-clamp-1">
                            {selectedItem.title || selectedItem.style || 'Untitled Visual'}
                          </h3>
                          <button
                            type="button"
                            className="ml-2 px-2 py-0.5 rounded-full bg-surface-container-highest text-primary text-[10px] font-bold hover:bg-primary hover:text-on-primary transition-colors flex items-center gap-1 shrink-0"
                            title={totalVersions > 1 ? `View ${totalVersions} versions` : 'View 1 version'}
                          >
                            <span className="material-symbols-outlined text-[12px]">history</span>
                            {totalVersions > 1 ? `${totalVersions} versions` : 'v1'}
                          </button>
                        </div>
                        <span className="text-label-sm text-outline shrink-0 whitespace-nowrap ml-2">
                          {formatRelativeTime(selectedItem.createdAt)}
                        </span>
                      </div>
                      <p className="text-body-md text-on-surface-variant line-clamp-2 mb-6">
                        {selectedItem.curriculumText || selectedItem.originalText || 'No description'}
                      </p>

                      {totalVersions > 1 && (
                        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                          {group.items.map((version, index) => {
                            const versionNumber = totalVersions - index;
                            const isActive = version.id === selectedItemId;

                            if (isActive) {
                              return (
                                <div
                                  key={version.id}
                                  className="w-12 h-12 rounded border-2 border-primary shrink-0 overflow-hidden cursor-pointer"
                                  title={`Version ${versionNumber}`}
                                >
                                  <img
                                    alt={`v${versionNumber}`}
                                    className="w-full h-full object-cover opacity-100"
                                    src={resolveMediaUrl(version.imageUrl)}
                                  />
                                </div>
                              );
                            } else {
                              return (
                                <div
                                  key={version.id}
                                  onClick={() =>
                                    setSelectedVersionMap((prev) => ({
                                      ...prev,
                                      [group.rootId]: version.id,
                                    }))
                                  }
                                  className="w-12 h-12 rounded border border-outline-variant shrink-0 overflow-hidden cursor-pointer hover:border-primary transition-colors flex items-center justify-center text-[10px] font-bold text-outline bg-surface-container-high"
                                  title={`Switch to Version ${versionNumber}`}
                                >
                                  v{versionNumber}
                                </div>
                              );
                            }
                          })}
                        </div>
                      )}

                      <div className="mt-auto flex gap-2">
                        <a
                          href={resolveMediaUrl(selectedItem.imageUrl)}
                          download
                          className="flex-1 py-2 px-3 flex items-center justify-center gap-2 bg-surface-container-high text-primary font-label-md border border-primary/20 rounded-lg hover:bg-primary hover:text-on-primary transition-all text-center"
                        >
                          <span className="material-symbols-outlined text-[18px]">download</span>
                          Download
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            if (activeRegenGroupId === group.rootId) {
                              setActiveRegenGroupId(null);
                            } else {
                              setActiveRegenGroupId(group.rootId);
                              setRegenTextMap((prev) => ({
                                ...prev,
                                [group.rootId]: selectedItem.curriculumText || selectedItem.originalText || '',
                              }));
                            }
                          }}
                          disabled={Boolean(regeneratingItemId)}
                          className="flex-1 py-2 px-3 flex items-center justify-center gap-2 bg-surface-container-high text-primary font-label-md border border-primary/20 rounded-lg hover:bg-primary hover:text-on-primary transition-all"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {regeneratingItemId === selectedItem.id ? 'progress_activity' : 'refresh'}
                          </span>
                          {regeneratingItemId === selectedItem.id ? 'Regenerating' : 'Regenerate'}
                        </button>
                      </div>
                    </div>

                    {activeRegenGroupId === group.rootId && (
                      <div className="regen-form p-5 border-t border-outline-variant bg-surface-container-low">
                        <label htmlFor={`regen-text-${group.rootId}`} className="block font-headline-sm text-on-surface mb-2">Curriculum Context</label>
                        <textarea
                          id={`regen-text-${group.rootId}`}
                          value={regenTextMap[group.rootId] || ''}
                          onChange={(e) =>
                            setRegenTextMap((prev) => ({
                              ...prev,
                              [group.rootId]: e.target.value,
                            }))
                          }
                          maxLength={1000}
                          className="w-full p-3 rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary text-body-md mb-4 resize-none h-24"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleRegenerate(selectedItem, regenTextMap[group.rootId])}
                            disabled={Boolean(regeneratingItemId)}
                            className="flex-1 py-2 bg-primary text-on-primary font-label-md rounded-lg hover:opacity-90 transition-all disabled:opacity-55"
                          >
                            Confirm Regeneration
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveRegenGroupId(null)}
                            className="flex-1 py-2 bg-surface-container-high text-on-surface-variant font-label-md rounded-lg hover:bg-surface-container transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-16 flex flex-col items-center gap-4">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-8 py-3 bg-surface-container-lowest border border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-on-primary transition-all shadow-sm disabled:opacity-70 inline-flex items-center gap-2"
              >
                {isLoadingMore ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Loading...
                  </>
                ) : (
                  'Load Historical Records'
                )}
              </button>
              <p className="text-label-sm text-outline">
                Displaying {filteredGroups.length} of {Math.max(groupedItems.length, filteredGroups.length)} generated visuals
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-6xl text-surface-dim mb-4 block">image_not_supported</span>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-2">No visuals yet</h3>
            <p className="font-body-md text-on-surface-variant mb-6 max-w-md mx-auto">
              {query ? 'No results match your search. Try a different query.' : 'Start generating visual aids to see them here.'}
            </p>
            <Link
              to="/generator"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-lg font-label-md hover:opacity-90 transition-all"
            >
              <span className="material-symbols-outlined">auto_awesome</span>
              Create First Visual
            </Link>
          </div>
        )}
      </div>

      <Link
        to="/generator"
        className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50"
        aria-label="Create new visual aid"
      >
        <span className="material-symbols-outlined">add</span>
      </Link>
    </>
  );
}
