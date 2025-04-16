import { create } from "zustand";
import { createComponent } from "../utils/componentLoader";
import {
    generatePythonLoaderCode,
    generateQtUiFile,
} from "../utils/generatePySideCode";
import { exportToUiFile, importFromUiFile } from "../utils/saveSystem";
import JSZip from "jszip";

const initialScreen = {
    id: 0,
    name: "Screen 1",
    customId: "screen_0",
    components: [],
    backgroundColor: "#ffffff",
    width: 1280,
    height: 800,
};

export const useAppStore = create((set, get) => ({
    screens: [initialScreen],
    nextScreenId: 1,
    currentScreenIndex: 0,
    nextComponentId: 0,
    selectedComponentId: null,
    zoomLevel: 1,
    minZoom: 0.1,
    maxZoom: 3,
    panPosition: { x: 0, y: 0 },
    isPanning: false,
    lastMousePosition: { x: 0, y: 0 },

    // Actions
    addComponent: (type) => {
        const { nextComponentId, screens, currentScreenIndex } = get();
        const newComponent = createComponent(type, nextComponentId);
        const updatedScreens = [...screens];
        updatedScreens[currentScreenIndex].components.push(newComponent);
        set({
            screens: updatedScreens,
            nextComponentId: nextComponentId + 1,
            selectedComponentId: newComponent.id,
        });
    },

    addScreen: () => {
        const { nextScreenId, screens } = get();
        const newScreen = {
            id: nextScreenId,
            name: `Screen ${nextScreenId + 1}`,
            customId: `screen_${nextScreenId}`,
            components: [],
            backgroundColor: "#ffffff",
            width: 1280,
            height: 800,
        };
        set({
            screens: [...screens, newScreen],
            nextScreenId: nextScreenId + 1,
            currentScreenIndex: screens.length,
        });
    },

    updateScreenCustomId: (screenIndex, newCustomId) => {
        const { screens } = get();
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
        const isDuplicate = screens.some(
            (screen, idx) =>
                idx !== screenIndex && screen.customId === newCustomId
        );
        if (isDuplicate) {
            alert("Screen ID must be unique");
            return false;
        }
        const updatedScreens = [...screens];
        updatedScreens[screenIndex].customId = newCustomId;
        set({ screens: updatedScreens });
        return true;
    },

    deleteScreen: (screenId) => {
        const { screens, currentScreenIndex } = get();
        if (screens.length > 1) {
            const updatedScreens = screens.filter(
                (screen) => screen.id !== screenId
            );
            set({
                screens: updatedScreens,
                currentScreenIndex: Math.min(
                    currentScreenIndex,
                    updatedScreens.length - 1
                ),
                selectedComponentId: null,
            });
        }
    },

    deleteComponent: (id) => {
        const { screens, selectedComponentId } = get();
        const updatedScreens = screens.map((screen) => ({
            ...screen,
            components: screen.components.filter(
                (component) => component.id !== id
            ),
        }));
        set({
            screens: updatedScreens,
            selectedComponentId:
                selectedComponentId === id ? null : selectedComponentId,
        });
    },

    resizeComponent: (id, newSizeAndPosition) => {
        const { screens } = get();
        const updatedScreens = screens.map((screen) => ({
            ...screen,
            components: screen.components.map((component) =>
                component.id === id
                    ? { ...component, ...newSizeAndPosition }
                    : component
            ),
        }));
        set({ screens: updatedScreens });
    },

    moveComponent: (id, newPosition) => {
        const { screens } = get();
        const updatedScreens = screens.map((screen) => ({
            ...screen,
            components: screen.components.map((component) =>
                component.id === id
                    ? { ...component, x: newPosition.x, y: newPosition.y }
                    : component
            ),
        }));
        set({ screens: updatedScreens });
    },

    updateComponentProps: (id, newProps) => {
        const { screens } = get();
        const updatedScreens = screens.map((screen) => ({
            ...screen,
            components: screen.components.map((component) =>
                component.id === id ? { ...component, ...newProps } : component
            ),
        }));
        set({ screens: updatedScreens });
    },

    updateScreenBackgroundColor: (screenIndex, newColor) => {
        const { screens } = get();
        const updatedScreens = [...screens];
        updatedScreens[screenIndex].backgroundColor = newColor;
        set({ screens: updatedScreens });
    },

    updateScreenDimensions: (screenIndex, dimensions) => {
        const { screens } = get();
        const updatedScreens = [...screens];
        if (dimensions.width)
            updatedScreens[screenIndex].width = dimensions.width;
        if (dimensions.height)
            updatedScreens[screenIndex].height = dimensions.height;
        set({ screens: updatedScreens });
    },

    selectComponent: (id) => set({ selectedComponentId: id }),

    duplicateComponent: () => {
        const {
            selectedComponentId,
            screens,
            currentScreenIndex,
            nextComponentId,
        } = get();
        if (!selectedComponentId) return;
        let componentToDuplicate = null;
        for (const screen of screens) {
            const found = screen.components.find(
                (comp) => comp.id === selectedComponentId
            );
            if (found) {
                componentToDuplicate = found;
                break;
            }
        }
        if (!componentToDuplicate) return;
        const newComponent = {
            ...JSON.parse(JSON.stringify(componentToDuplicate)),
            id: nextComponentId,
            x: componentToDuplicate.x + 20,
            y: componentToDuplicate.y + 20,
        };
        const updatedScreens = [...screens];
        updatedScreens[currentScreenIndex].components.push(newComponent);
        set({
            screens: updatedScreens,
            nextComponentId: nextComponentId + 1,
            selectedComponentId: newComponent.id,
        });
    },

    setCurrentScreenIndex: (idx) => set({ currentScreenIndex: idx }),

    // Zoom & Pan
    setZoomLevel: (zoom) => set({ zoomLevel: zoom }),
    setPanPosition: (pos) => set({ panPosition: pos }),
    setIsPanning: (val) => set({ isPanning: val }),
    setLastMousePosition: (pos) => set({ lastMousePosition: pos }),

    handleZoomIn: () => {
        const { zoomLevel, maxZoom } = get();
        set({ zoomLevel: Math.min(maxZoom, zoomLevel + 0.1) });
    },
    handleZoomOut: () => {
        const { zoomLevel, minZoom } = get();
        set({ zoomLevel: Math.max(minZoom, zoomLevel - 0.1) });
    },
    handleWheel: (e) => {
        const { zoomLevel, minZoom, maxZoom } = get();
        if (e.ctrlKey) {
            e.preventDefault();
            const zoomFactor = e.deltaY > 0 ? -0.05 : 0.05;
            set({
                zoomLevel: Math.max(
                    minZoom,
                    Math.min(maxZoom, zoomLevel + zoomFactor)
                ),
            });
        }
    },
    handlePanStart: (e) => {
        if (e.button === 1 || e.altKey) {
            set({
                isPanning: true,
                lastMousePosition: { x: e.clientX, y: e.clientY },
            });
            e.preventDefault();
        }
    },
    handlePanMove: (e) => {
        const { isPanning, lastMousePosition, panPosition } = get();
        if (isPanning) {
            const deltaX = e.clientX - lastMousePosition.x;
            const deltaY = e.clientY - lastMousePosition.y;
            set({
                panPosition: {
                    x: panPosition.x + deltaX,
                    y: panPosition.y + deltaY,
                },
                lastMousePosition: { x: e.clientX, y: e.clientY },
            });
            e.preventDefault();
        }
    },
    handlePanEnd: () => set({ isPanning: false }),
    handleResetView: () => set({ panPosition: { x: 0, y: 0 }, zoomLevel: 1 }),

    // Export/Import
    handleExport: async (centerPanelDimensions) => {
        const { screens, currentScreenIndex } = get();
        const uiFile = generateQtUiFile(
            screens,
            currentScreenIndex,
            centerPanelDimensions
        );
        const pythonFile = generatePythonLoaderCode();
        const zip = new JSZip();
        zip.file("ui-designer.ui", uiFile);
        zip.file("main.py", pythonFile);
        const zipContent = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(zipContent);
        const link = document.createElement("a");
        link.href = url;
        link.download = "ui-project.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    handleSaveToUiFile: () => {
        const { screens, currentScreenIndex } = get();
        exportToUiFile(screens, currentScreenIndex);
    },

    handleLoadFromUiFile: async (file) => {
        try {
            const appState = await importFromUiFile(file);
            if (!appState.screens || !Array.isArray(appState.screens)) {
                throw new Error("Invalid file format: missing screens array");
            }
            set({
                screens: appState.screens,
                nextScreenId: appState.nextScreenId || appState.screens.length,
                currentScreenIndex: Math.min(
                    appState.currentScreenIndex || 0,
                    appState.screens.length - 1
                ),
                nextComponentId: appState.nextComponentId,
                selectedComponentId: null,
            });
        } catch (error) {
            alert(`Error loading design: ${error.message}`);
            console.error("Import error:", error);
        }
    },
}));
