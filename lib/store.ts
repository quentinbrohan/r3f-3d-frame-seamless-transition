import { create } from "zustand";

type Store = {
  isLoaderLoaded: boolean;
  setIsLoaderLoaded: (value: boolean) => void;
};

export const useStore = create<Store>((set) => ({
  isLoaderLoaded: false,
  setIsLoaderLoaded: (value) =>
    set({
      isLoaderLoaded: value,
    }),
}));
