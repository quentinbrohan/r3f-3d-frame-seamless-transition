import { create } from "zustand";

type Store = {
  currentProjectIndex: number;
  setCurrentProjectIndex: (value: number) => void;
  // TODO: prop for when transitionning from list to details
};

export const useStore = create<Store>((set) => ({
  currentProjectIndex: -1,
  setCurrentProjectIndex: (value) =>
    set({
      currentProjectIndex: value,
    }),
}));
