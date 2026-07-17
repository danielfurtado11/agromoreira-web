"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

/** How long the message stays on screen. */
const TOAST_MS = 4000;

/**
 * Small notice fixed to the bottom-right corner of the screen, dismissed
 * automatically after a few seconds.
 *
 * Rendered through a portal into <body>: the product cards apply a transform
 * on hover, and a transformed ancestor becomes the containing block for
 * position:fixed — rendered in place, the toast would stick to the card
 * instead of the viewport.
 *
 * The parent owns the message state and clears it in `onDismiss`; this
 * component only runs the timer.
 */
export function Toast({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, TOAST_MS);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return createPortal(
    <p
      role="status"
      className="fixed bottom-4 right-4 z-50 max-w-xs rounded-xl border border-line bg-white px-4 py-3 text-sm font-medium text-ink shadow-lg"
    >
      {message}
    </p>,
    document.body,
  );
}
