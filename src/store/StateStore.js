import { useScreenStore } from "./ScreenStore";
import { useComponentStore } from "./ComponentStore";

export function useAppStore() {
    const screenState = useScreenStore();
    const componentState = useComponentStore();

    const setAppState = (appState) => {
        useScreenStore.setState((state) => {
            state.screens = appState.screens;
            state.nextScreenId =
                appState.nextScreenId || appState.screens.length;
            state.currentScreenIndex = Math.min(
                appState.currentScreenIndex || 0,
                appState.screens.length - 1
            );
        });

        useComponentStore.setState((state) => {
            state.nextComponentId = appState.nextComponentId;
            state.selectedComponentId = null;
        });
    };

    return {
        ...screenState,
        ...componentState,
        setAppState,
    };
}
