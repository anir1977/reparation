"use client";

import { useState } from "react";
import Image from "next/image";
import { XMarkIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon } from "@heroicons/react/24/outline";

interface PhotoGalleryProps {
  photos: string[];
  onDeletePhoto?: (photoUrl: string) => void;
  editable?: boolean;
}

export function PhotoGallery({ photos, onDeletePhoto, editable = false }: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);

  if (!photos || photos.length === 0) {
    return null;
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setZoom(1);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    setZoom(1);
  };

  const nextPhoto = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % photos.length);
      setZoom(1);
    }
  };

  const prevPhoto = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length);
      setZoom(1);
    }
  };

  const handleDelete = (photoIndex: number) => {
    if (onDeletePhoto && editable) {
      const photoUrl = photos[photoIndex];
      if (confirm("Supprimer cette photo ?")) {
        onDeletePhoto(photoUrl);
        if (lightboxIndex === photoIndex) {
          closeLightbox();
        }
      }
    }
  };

  const zoomIn = () => setZoom(Math.min(zoom + 0.5, 3));
  const zoomOut = () => setZoom(Math.max(zoom - 0.5, 1));

  return (
    <>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {photos.map((url, photoIndex) => (
          <div key={`photo-${photoIndex}`} className="relative group">
            <button
              type="button"
              onClick={() => openLightbox(photoIndex)}
              className="block w-full"
            >
              <Image
                src={url}
                alt={`Photo ${photoIndex + 1}`}
                width={160}
                height={160}
                unoptimized
                className="h-20 w-full rounded-xl border-2 border-zinc-200 object-cover transition-all hover:border-amber-400 hover:shadow-lg cursor-zoom-in"
              />
            </button>
            {editable && onDeletePhoto && (
              <button
                type="button"
                onClick={() => handleDelete(photoIndex)}
                className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 active:scale-95"
                title="Supprimer la photo"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
            title="Fermer"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          {/* Zoom controls */}
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                zoomOut();
              }}
              disabled={zoom <= 1}
              className="rounded-full bg-white/10 p-3 text-white backdrop-blur-sm hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Zoom arrière"
            >
              <MagnifyingGlassMinusIcon className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                zoomIn();
              }}
              disabled={zoom >= 3}
              className="rounded-full bg-white/10 p-3 text-white backdrop-blur-sm hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Zoom avant"
            >
              <MagnifyingGlassPlusIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Photo counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm">
            {lightboxIndex + 1} / {photos.length}
          </div>

          {/* Navigation */}
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prevPhoto();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
                title="Photo précédente"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextPhoto();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
                title="Photo suivante"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Image */}
          <div
            className="relative max-h-full max-w-full overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[lightboxIndex]}
              alt={`Photo ${lightboxIndex + 1}`}
              width={1200}
              height={1200}
              unoptimized
              className="max-h-[85vh] w-auto rounded-lg object-contain transition-transform"
              style={{ transform: `scale(${zoom})` }}
            />
          </div>

          {/* Delete button in lightbox */}
          {editable && onDeletePhoto && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(lightboxIndex);
              }}
              className="absolute bottom-4 right-4 rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white shadow-lg hover:bg-red-600 transition-colors"
              title="Supprimer cette photo"
            >
              Supprimer
            </button>
          )}
        </div>
      )}
    </>
  );
}
