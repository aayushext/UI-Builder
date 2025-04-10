import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { useScreenStore } from "@/store/ScreenStore";

const initialComponentState = {
    nextComponentId: 0,
    selectedComponentId: null,
};

export const useComponentStore = create(
    immer((set, get) => ({
        ...initialComponentState,

        getCurrentScreenComponents: () => {
            const { getCurrentScreen } = useScreenStore.getState();
            const currentScreen = getCurrentScreen();
            return currentScreen?.components || [];
        },

        getSelectedComponent: () => {
            const components = get().getCurrentScreenComponents();
            return components.find((c) => c.id === get().selectedComponentId);
        },

        addComponent: (type) =>
            set((state) => {
                try {
                    const {
                        createComponent,
                    } = require("@/utils/componentLoader");
                    const { screens, currentScreenIndex } =
                        useScreenStore.getState();

                    const newComponent = createComponent(
                        type,
                        state.nextComponentId
                    );

                    useScreenStore.setState((screenState) => {
                        screenState.screens[currentScreenIndex].components.push(
                            newComponent
                        );
                    });

                    state.nextComponentId += 1;
                    state.selectedComponentId = newComponent.id;
                } catch (error) {
                    console.error(`Error creating component: ${error.message}`);
                }
            }),

        deleteComponent: (id) =>
            set((state) => {
                useScreenStore.setState((screenState) => {
                    screenState.screens.forEach((screen) => {
                        screen.components = screen.components.filter(
                            (component) => component.id !== id
                        );
                    });
                });

                if (state.selectedComponentId === id) {
                    state.selectedComponentId = null;
                }
            }),

        resizeComponent: (id, newSizeAndPosition) =>
            set((state) => {
                useScreenStore.setState((screenState) => {
                    screenState.screens.forEach((screen) => {
                        const component = screen.components.find(
                            (c) => c.id === id
                        );
                        if (component) {
                            Object.assign(component, newSizeAndPosition);
                        }
                    });
                });
            }),

        moveComponent: (id, newPosition) =>
            set((state) => {
                useScreenStore.setState((screenState) => {
                    screenState.screens.forEach((screen) => {
                        const component = screen.components.find(
                            (c) => c.id === id
                        );
                        if (component) {
                            component.x = newPosition.x;
                            component.y = newPosition.y;
                        }
                    });
                });
            }),

        updateComponentProps: (id, newProps) =>
            set((state) => {
                useScreenStore.setState((screenState) => {
                    screenState.screens.forEach((screen) => {
                        const component = screen.components.find(
                            (c) => c.id === id
                        );
                        if (component) {
                            Object.assign(component, newProps);
                        }
                    });
                });
            }),

        selectComponent: (id) => set({ selectedComponentId: id }),

        duplicateComponent: () =>
            set((state) => {
                if (!state.selectedComponentId) return;

                const { screens, currentScreenIndex } =
                    useScreenStore.getState();

                let componentToDuplicate = null;
                let foundScreenIndex = -1;

                for (let i = 0; i < screens.length; i++) {
                    const found = screens[i].components.find(
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

                useScreenStore.setState((screenState) => {
                    screenState.screens[currentScreenIndex].components.push(
                        newComponent
                    );
                });

                state.nextComponentId += 1;
                state.selectedComponentId = newComponent.id;
            }),
    }))
);
