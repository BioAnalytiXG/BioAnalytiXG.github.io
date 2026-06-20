"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog } from "radix-ui";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Play, X } from "lucide-react";

import { cn } from "@/lib/utils";

interface VideoModalButtonProps {
  src: string;
  label?: string;
  title?: string;
  className?: string;
  /** Optional poster image shown before playback. */
  poster?: string;
}

/**
 * A secondary CTA that opens a modal and plays a video.
 *
 * The dialog autoplays the video on open (the click is a user gesture, so audio
 * is allowed) and pauses + resets it on close. Built on the Radix Dialog
 * primitive; styled with the shared design tokens.
 */
export function VideoModalButton({
  src,
  label = "See how it works",
  title = "Product walkthrough",
  className,
  poster,
}: VideoModalButtonProps) {
  const [open, setOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (open) {
      video.currentTime = 0;
      video.muted = false;
      void video.play().catch(() => {
        // If the browser blocks autoplay with sound, start muted so it still
        // begins immediately; the user can unmute via the controls.
        video.muted = true;
        void video.play().catch(() => {});
      });
    } else {
      video.pause();
    }
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className,
          )}
        >
          <Play aria-hidden="true" className="size-4" />
          {label}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-5xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-border bg-black shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <VisuallyHidden>
            <Dialog.Title>{title}</Dialog.Title>
          </VisuallyHidden>

          <Dialog.Close
            aria-label="Close video"
            className="absolute right-3 top-3 z-10 inline-flex size-9 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <X className="size-5" />
          </Dialog.Close>

          <video
            ref={videoRef}
            src={src}
            poster={poster}
            controls
            autoPlay
            playsInline
            preload="auto"
            className="aspect-video h-auto w-full bg-black"
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default VideoModalButton;
