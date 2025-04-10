import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

const initialScreenState = {
    screens: [
        {
            id: 0,
            name: "Screen 1",
            customId: "screen_0",
            components: [],
            backgroundColor: "#ffffff",
            width: 1280,
            height: 800,
        },
    ],
    nextScreenId: 1,
    currentScreenIndex: 0,
    panPosition: { x: 0, y: 0 },
    isPanning: false,
    lastMousePosition: { x: 0, y: 0 },
    zoomLevel: 1,
    minZoom: 0.1,
    maxZoom: 3,
};

export const useScreenStore = create(
    immer((set, get) => ({
        ...initialScreenState,

        getCurrentScreen: () => {
            const state = get();
            return state.screens[state.currentScreenIndex];
        },

        addScreen: () =>
            set((state) => {
                const newScreen = {
                    id: state.nextScreenId,
                    name: `Screen ${state.nextScreenId + 1}`,
                    customId: `screen_${state.nextScreenId}`,
                    components: [],
                    backgroundColor: "#ffffff",
                    width: 1280,
                    height: 800,
                };
                state.screens.push(newScreen);
                state.nextScreenId += 1;
                state.currentScreenIndex = state.screens.length - 1;
            }),

        updateScreenCustomId: (screenIndex, newCustomId) => {
            if (!/^[a-zA-Z0-9_]+$/.test(newCustomId)) {
                alert(
                    "Screen ID can only contain letters, numbers, and underscores"
                );
                return false;
            }

            if (newCustomId.length > 20) {
                alert("Screen ID cannot exceed 20 characters");
                return false;
            }

            const isDuplicate = get().screens.some(
                (screen, idx) =>
                    idx !== screenIndex && screen.customId === newCustomId
            );

            if (isDuplicate) {
                alert("Screen ID must be unique");
                return false;
            }

            set((state) => {
                state.screens[screenIndex].customId = newCustomId;
            });
            return true;
        },

        deleteScreen: (screenId) =>
            set((state) => {
                if (state.screens.length > 1) {
                    const screenIndex = state.screens.findIndex(
                        (screen) => screen.id === screenId
                    );
                    state.screens.splice(screenIndex, 1);

                    if (state.currentScreenIndex >= state.screens.length) {
                        state.currentScreenIndex = state.screens.length - 1;
                    }
                }
            }),

        updateScreenBackgroundColor: (screenIndex, newColor) =>
            set((state) => {
                state.screens[screenIndex].backgroundColor = newColor;
            }),

        updateScreenDimensions: (screenIndex, dimensions) =>
            set((state) => {
                if (dimensions.width) {
                    state.screens[screenIndex].width = dimensions.width;
                }
                if (dimensions.height) {
                    state.screens[screenIndex].height = dimensions.height;
                }
            }),

        setCurrentScreenIndex: (index) => set({ currentScreenIndex: index }),

        handleZoomIn: () =>
            set((state) => {
                state.zoomLevel = Math.min(
                    state.maxZoom,
                    state.zoomLevel + 0.1
                );
            }),

        handleZoomOut: () =>
            set((state) => {
                state.zoomLevel = Math.max(
                    state.minZoom,
                    state.zoomLevel - 0.1
                );
            }),

        handleWheelZoom: (deltaY) =>
            set((state) => {
                const zoomFactor = deltaY > 0 ? -0.05 : 0.05;
                state.zoomLevel = Math.max(
                    state.minZoom,
                    Math.min(state.maxZoom, state.zoomLevel + zoomFactor)
                );
            }),

        setPanPosition: (position) => set({ panPosition: position }),

        setIsPanning: (panning) => set({ isPanning: panning }),

        setLastMousePosition: (position) =>
            set({ lastMousePosition: position }),

        resetView: () =>
            set((state) => {
                state.panPosition = { x: 0, y: 0 };
                state.zoomLevel = 1;
            }),
    }))
);
