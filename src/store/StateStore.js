import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

// Initial state matching your current useState setup
const initialState = {
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
    nextComponentId: 0,
    selectedComponentId: null,
    panPosition: { x: 0, y: 0 },
    isPanning: false,
    lastMousePosition: { x: 0, y: 0 },
    zoomLevel: 1,
    minZoom: 0.1,
    maxZoom: 3,
};

export const useUIStore = create(
    immer((set, get) => ({
        ...initialState,

        getCurrentScreen: () => {
            const state = get();
            return state.screens[state.currentScreenIndex];
        },

        getCurrentScreenComponents: () => {
            const screen = get().getCurrentScreen();
            return screen?.components || [];
        },

        getSelectedComponent: () => {
            const state = get();
            const currentComponents = state.getCurrentScreenComponents();
            return currentComponents.find(
                (c) => c.id === state.selectedComponentId
            );
        },

        addComponent: (type) =>
            set((state) => {
                try {
                    const {
                        createComponent,
                    } = require("../utils/componentLoader");

                    const newComponent = createComponent(
                        type,
                        state.nextComponentId
                    );
                    state.screens[state.currentScreenIndex].components.push(
                        newComponent
                    );
                    state.nextComponentId += 1;
                    state.selectedComponentId = newComponent.id;
                } catch (error) {
                    console.error(`Error creating component: ${error.message}`);
                }
            }),

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
                    state.selectedComponentId = null;
                }
            }),

        deleteComponent: (id) =>
            set((state) => {
                state.screens.forEach((screen) => {
                    screen.components = screen.components.filter(
                        (component) => component.id !== id
                    );
                });

                if (state.selectedComponentId === id) {
                    state.selectedComponentId = null;
                }
            }),

        resizeComponent: (id, newSizeAndPosition) =>
            set((state) => {
                state.screens.forEach((screen) => {
                    const component = screen.components.find(
                        (c) => c.id === id
                    );
                    if (component) {
                        Object.assign(component, newSizeAndPosition);
                    }
                });
            }),

        moveComponent: (id, newPosition) =>
            set((state) => {
                state.screens.forEach((screen) => {
                    const component = screen.components.find(
                        (c) => c.id === id
                    );
                    if (component) {
                        component.x = newPosition.x;
                        component.y = newPosition.y;
                    }
                });
            }),

        updateComponentProps: (id, newProps) =>
            set((state) => {
                state.screens.forEach((screen) => {
                    const component = screen.components.find(
                        (c) => c.id === id
                    );
                    if (component) {
                        Object.assign(component, newProps);
                    }
                });
            }),

        updateScreenBackgroundColor: (screenIndex, newColor) =>
            set((state) => {
                state.screens[screenIndex].backgroundColor = newColor;
            }),

        updateScreenDimensions: (screenIndex, dimensions) =>
            set((state) => {
                state.screens.forEach((screen) => {
                    if (dimensions.width) {
                        screen.width = dimensions.width;
                    }
                    if (dimensions.height) {
                        screen.height = dimensions.height;
                    }
                });
            }),

        selectComponent: (id) =>
            set((state) => {
                state.selectedComponentId = id;
            }),

        duplicateComponent: () =>
            set((state) => {
                if (!state.selectedComponentId) return;

                let componentToDuplicate = null;
                let foundScreenIndex = -1;

                for (let i = 0; i < state.screens.length; i++) {
                    const found = state.screens[i].components.find(
                        (comp) => comp.id === state.selectedComponentId
                    );
                    if (found) {
                        componentToDuplicate = found;
                        foundScreenIndex = i;
                        break;
                    }
                }

                if (!componentToDuplicate) return;

                const newComponent = {
                    ...JSON.parse(JSON.stringify(componentToDuplicate)),
                    id: state.nextComponentId,
                    x: componentToDuplicate.x + 20,
                    y: componentToDuplicate.y + 20,
                };

                state.screens[state.currentScreenIndex].components.push(
                    newComponent
                );
                state.nextComponentId += 1;
                state.selectedComponentId = newComponent.id;
            }),

        // Zoom and Pan functions
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

        // Save/Load
        setAppState: (appState) =>
            set((state) => {
                state.screens = appState.screens;
                state.nextScreenId =
                    appState.nextScreenId || appState.screens.length;
                state.currentScreenIndex = Math.min(
                    appState.currentScreenIndex || 0,
                    appState.screens.length - 1
                );
                state.nextComponentId = appState.nextComponentId;
                state.selectedComponentId = null;
            }),

        setCurrentScreenIndex: (index) => set({ currentScreenIndex: index }),
    }))
);
