"use client";

interface DinoPlayHintProps {
  visible: boolean;
}

export default function DinoPlayHint({ visible }: DinoPlayHintProps) {
  if (!visible) {
    return null;
  }

  return (
    <p
      className="absolute bottom-20 left-0 right-0 z-[4] m-0 text-center text-sm text-black sm:bottom-1"
      role="status"
      aria-live="polite"
    >
      Tap or press space to play
    </p>
  );
}
