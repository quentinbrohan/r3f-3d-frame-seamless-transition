import { create } from "zustand";

type Store = {
  isLoaderLoaded: boolean;
  setIsLoaderLoaded: (value: boolean) => void;
  isListFrameHovered: boolean;
  setIsListFrameHovered: (value: boolean) => void;
};

export const useStore = create<Store>((set) => ({
  isLoaderLoaded: false,
  setIsLoaderLoaded: (value) =>
    set({
      isLoaderLoaded: value,
    }),
  isListFrameHovered: false,
  setIsListFrameHovered: (value) =>
    set({
      isListFrameHovered: value,
    }),
}));
