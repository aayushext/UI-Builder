/**
 * The initial screen state for the application.
 * @type {object}
 */
export const initialScreen = {
    id: 0,
    name: "Screen 1",
    customId: "screen_0",
    components: [],
    backgroundColor: "#ffffff",
    width: 1280,
    height: 800,
};

export const createScreenSlice = (set, get) => ({
    screens: [initialScreen],
    nextScreenId: 1,
    currentScreenIndex: 0,
    addScreen: () => {
        const { nextScreenId, screens } = get(); // Accessing state from the same slice
        const newScreen = {
            id: nextScreenId,
            name: `Screen ${nextScreenId + 1}`,
            customId: `screen_${nextScreenId}`,
            components: [],
            backgroundColor: "#ffffff",
            width: 1280,
            height: 800,
        };
        set({ // Updating state within this slice
            screens: [...screens, newScreen],
            nextScreenId: nextScreenId + 1,
            currentScreenIndex: screens.length -1, // Select the new screen (index is length - 1)
        });
    },
    updateScreenCustomId: (screenIndex, newCustomId) => {
        const { screens } = get(); // Accessing state from the same slice
        if (!/^[a-zA-Z0-9_]+$/.test(newCustomId)) {
            alert("Screen ID can only contain letters, numbers, and underscores");
            return false;
        }
        if (newCustomId.length > 20) {
            alert("Screen ID cannot exceed 20 characters");
            return false;
        }
        if (screens.some((screen, idx) => idx !== screenIndex && screen.customId === newCustomId)) {
            alert("Screen ID must be unique");
            return false;
        }
        const updatedScreens = screens.map((s, idx) => idx === screenIndex ? { ...s, customId: newCustomId } : s);
        set({ screens: updatedScreens }); // Updating state within this slice
        return true;
    },
    deleteScreen: (screenId) => {
        const { screens, currentScreenIndex } = get(); // Accessing state from the same slice
        if (screens.length <= 1) return; // Cannot delete the last screen
        const updatedScreens = screens.filter((screen) => screen.id !== screenId);
        const newCurrentScreenIndex = Math.min(currentScreenIndex, updatedScreens.length - 1);
        set({ // Updating state within this slice
            screens: updatedScreens,
            currentScreenIndex: newCurrentScreenIndex,
        });
        // Assuming selectComponent will be available via get() from componentStore once integrated
        if (get().selectComponent) {
            get().selectComponent(null);
        }
    },
    updateScreenBackgroundColor: (screenIndex, newColor) => {
        const { screens } = get(); // Accessing state from the same slice
        const updatedScreens = screens.map((s, idx) => idx === screenIndex ? { ...s, backgroundColor: newColor } : s);
        set({ screens: updatedScreens }); // Updating state within this slice
    },
    updateScreenDimensions: (screenIndex, dimensions) => {
        const { screens } = get(); // Accessing state from the same slice
        const updatedScreens = screens.map((s, idx) => idx === screenIndex ? { ...s, ...dimensions } : s);
        set({ screens: updatedScreens }); // Updating state within this slice
    },
    setCurrentScreenIndex: (idx) => {
        set({ currentScreenIndex: idx }); // Updating state within this slice
        // Assuming selectComponent will be available via get() from componentStore once integrated
        if (get().selectComponent) {
             get().selectComponent(null);
        }
    },
});
