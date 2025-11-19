import { useEffect } from "react";

interface KeyboardNavigationProps {
  showContent: boolean;
  handlePrev: () => void;
  handleNext: () => void;
  handleStartMovement: () => void;
}

export const useKeyboardNavigation = ({
  showContent,
  handleNext,
  handlePrev,
  handleStartMovement,
}: KeyboardNavigationProps) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (showContent) return;
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Enter") handleStartMovement();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleNext, handlePrev, handleStartMovement, showContent]);

  return null;
};
