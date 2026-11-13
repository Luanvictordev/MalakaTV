"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize2, RotateCcw, X, ZoomIn, ZoomOut } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { EASE_OUT_EXPO } from "./Motion";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function ZoomableImage({
  src,
  alt,
  caption,
  className = "",
}: {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dragOrigin = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const movedRef = useRef(false);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    resetView();
  }, [resetView]);

  const applyZoom = useCallback((next: number) => {
    const clamped = clamp(Number(next.toFixed(2)), MIN_ZOOM, MAX_ZOOM);
    setZoom(clamped);
    if (clamped <= 1) setPan({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const rafId = requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      cancelAnimationFrame(rafId);
      document.body.style.overflow = prevOverflow;
      triggerRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      else if (event.key === "+" || event.key === "=") applyZoom(zoom + 0.5);
      else if (event.key === "-") applyZoom(zoom - 0.5);
      else if (event.key === "0") resetView();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, zoom, close, applyZoom, resetView]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          resetView();
          setOpen(true);
        }}
        className={`group relative block w-full overflow-hidden rounded-2xl bg-chrome text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
        aria-label={`Ampliar ${alt}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-on-chrome/15 bg-chrome/85 px-3 py-1.5 text-[11px] font-semibold text-on-chrome backdrop-blur transition-colors group-hover:bg-primary group-hover:text-on-primary">
          <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
          Ampliar
        </span>
      </button>

      <AnimatePresence>
        {open ? (
          <m.div
            key="zoomable-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
            onClick={close}
            onWheel={(event) => {
              event.preventDefault();
              const delta = event.deltaY < 0 ? 0.35 : -0.35;
              applyZoom(zoom + delta);
            }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4 backdrop-blur-sm sm:p-8"
          >
            {/* Top controls */}
            <div
              onClick={(event) => event.stopPropagation()}
              className="fixed right-4 top-4 z-10 flex items-center gap-1.5 rounded-full border border-white/15 bg-chrome/90 p-1.5 text-on-chrome shadow-xl backdrop-blur"
            >
              <button
                type="button"
                onClick={() => applyZoom(zoom - 0.5)}
                disabled={zoom <= MIN_ZOOM}
                aria-label="Diminuir zoom"
                title="Diminuir zoom (-)"
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/10 disabled:opacity-35"
              >
                <ZoomOut className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className="min-w-[3.25rem] text-center font-mono text-xs font-semibold tabular-nums">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => applyZoom(zoom + 0.5)}
                disabled={zoom >= MAX_ZOOM}
                aria-label="Aumentar zoom"
                title="Aumentar zoom (+)"
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/10 disabled:opacity-35"
              >
                <ZoomIn className="h-4 w-4" aria-hidden="true" />
              </button>
              {zoom > 1 ? (
                <button
                  type="button"
                  onClick={resetView}
                  aria-label="Resetar zoom"
                  title="Resetar zoom (0)"
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/10"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              ) : null}
              <span className="mx-0.5 h-4 w-px bg-white/15" aria-hidden="true" />
              <button
                ref={closeButtonRef}
                type="button"
                onClick={close}
                aria-label="Fechar imagem"
                title="Fechar (Esc)"
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-primary hover:text-on-primary"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <m.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => {
                if (zoom <= 1) return;
                event.currentTarget.setPointerCapture(event.pointerId);
                movedRef.current = false;
                setDragging(true);
                dragOrigin.current = {
                  x: event.clientX,
                  y: event.clientY,
                  panX: pan.x,
                  panY: pan.y,
                };
              }}
              onPointerMove={(event) => {
                if (!dragging || !dragOrigin.current) return;
                const dx = event.clientX - dragOrigin.current.x;
                const dy = event.clientY - dragOrigin.current.y;
                if (Math.abs(dx) > 3 || Math.abs(dy) > 3) movedRef.current = true;
                setPan({
                  x: dragOrigin.current.panX + dx,
                  y: dragOrigin.current.panY + dy,
                });
              }}
              onPointerUp={() => {
                setDragging(false);
                dragOrigin.current = null;
              }}
              onPointerCancel={() => {
                setDragging(false);
                dragOrigin.current = null;
              }}
              onDoubleClick={() => {
                if (zoom > 1) resetView();
                else applyZoom(2.5);
              }}
              className={`relative flex max-h-[84vh] max-w-[94vw] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl select-none ${
                zoom > 1 ? (dragging ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in"
              }`}
              style={{ touchAction: zoom > 1 ? "none" : "auto" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt}
                draggable={false}
                onClick={() => {
                  if (movedRef.current) return;
                  if (zoom === 1) applyZoom(2);
                }}
                style={{
                  transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
                  transition: dragging ? "none" : "transform 150ms cubic-bezier(0.22, 1, 0.36, 1)",
                }}
                className="max-h-[82vh] max-w-full object-contain will-change-transform"
              />
            </m.div>

            <p className="mt-3 text-center text-xs text-white/65">
              {caption ? <span className="font-medium text-white/85">{caption} · </span> : null}
              Use o scroll do mouse, os botões acima ou clique duas vezes para dar zoom. Arraste para mover.
            </p>
          </m.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
