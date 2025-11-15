import { create } from "zustand";

type Store = {
  // TODO: rename as active project index ? Or in view ?
  currentProjectIndex: number;
  setCurrentProjectIndex: (value: number) => void;
  // TODO: prop for when transitionning from list to details like isZooming
};

export const useStore = create<Store>((set) => ({
  currentProjectIndex: -1,
  setCurrentProjectIndex: (value) =>
    set({
      currentProjectIndex: value,
    }),
}));
