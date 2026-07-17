"use client";

import { useEffect, useState } from "react";
import type { Announcement } from "@/lib/api/types";

/** How long each announcement stays before the next fades in. */
const ROTATE_MS = 10000;

/**
 * Cycles through the active announcements in the top bar, one at a time, fading
 * each in. With a single announcement it just shows it (no timer). The data is
 * fetched on the server by AnnouncementBar and handed down here, since the
 * rotation itself needs a browser timer.
 */
export function AnnouncementRotator({
  announcements,
}: {
  announcements: Announcement[];
}) {
  const [index, setIndex] = useState(0);
  const count = announcements.length;

  useEffect(() => {
    if (count < 2) return;
    const timer = setInterval(
      () => setIndex((current) => (current + 1) % count),
      ROTATE_MS,
    );
    return () => clearInterval(timer);
  }, [count]);

  // `index` can briefly outrun the array if the list shrank after a
  // revalidation, so wrap it rather than risk reading past the end.
  const current = announcements[index % count];

  return (
    <div className="border-b border-accent/40 bg-accent-soft text-accent-ink">
      <div className="mx-auto max-w-[1800px] px-4 py-2 text-center text-sm">
        {/* `key` remounts the text on each change, replaying the fade-in. */}
        <span key={index} className="announcement-fade inline-block">
          <span className="font-semibold">{current.title}:</span>{" "}
          {current.message}
        </span>
      </div>
    </div>
  );
}
