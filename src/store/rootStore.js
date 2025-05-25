import { create } from "zustand";
import { createScreenSlice } from "./screenStore";
import { createComponentSlice } from './componentStore';
import { createCanvasSlice } from './canvasStore';
import { createInteractionsSlice } from './interactionsStore';
import { createIoSlice } from './ioStore'; // Import io slice

/**
 * Zustand store for managing the application state.
 */
export const useAppStore = create((set, get) => {
    // Merging all parts (actual slices will be spread here)
    return {
        ...createScreenSlice(set, get),
        ...createComponentSlice(set, get),
        ...createCanvasSlice(set, get),
        ...createInteractionsSlice(set, get),
        ...createIoSlice(set, get), // Integrate io slice
    };
});
