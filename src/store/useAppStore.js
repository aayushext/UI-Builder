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
    dropTargetFrameId: null,

    updateDropTargetFrameId: (frameId) => set({ dropTargetFrameId: frameId }),

    /**
     * Calculates the absolute screen position of a component, traversing its parent hierarchy.
     * @param {number} componentId - The ID of the component.
     * @param {Array} allComponents - The array of all components in the current screen.
     * @returns {{x: number, y: number}} The absolute position, or {x: NaN, y: NaN} if error.
     * @private
     */
    _getAbsolutePosition: (componentId, allComponents) => {
        let x = 0,
            y = 0,
            currentId = componentId;
        const visited = new Set();
        while (currentId !== null) {
            if (visited.has(currentId)) {
                console.error(
                    "Cycle detected in parent hierarchy for ID:",
                    componentId
                );
                return { x: NaN, y: NaN };
            }
            visited.add(currentId);
            const comp = allComponents.find((c) => c.id === currentId);
            if (!comp) {
                console.error(
                    "Component not found during absolute position calculation for ID:",
                    currentId
                );
                return { x: NaN, y: NaN };
            }
            x += comp.x;
            y += comp.y;
            currentId = comp.parentId;
        }
        return { x, y };
    },

    /**
     * Adds a new component of the specified type to the current screen.
     * If a Frame is selected, the new component becomes its child.
     * @param {string} type - The type of component to add (e.g., 'PySideButton').
     */
    addComponent: (type) => {
        const {
            nextComponentId,
            screens,
            currentScreenIndex,
            selectedComponentId,
        } = get();
        const currentScreen = screens[currentScreenIndex];
        const selectedComponent = currentScreen?.components.find(
            (c) => c.id === selectedComponentId
        );

        let parentId = null,
            position = { x: 50, y: 50 };
        if (selectedComponent?.type === "PySideFrame") {
            parentId = selectedComponent.id;
            position = { x: 10, y: 10 };
            console.log(
                `addComponent: Adding ${type} inside Frame ID ${parentId}. Initial relative position:`,
                position
            );
        } else {
            console.log(
                `addComponent: Adding ${type} to screen. Initial absolute position:`,
                position
            );
        }

        const newComponent = createComponent(type, nextComponentId, position);
        newComponent.parentId = parentId;

        const updatedScreens = [...screens];
        updatedScreens[currentScreenIndex].components.push(newComponent);
        set({
            screens: updatedScreens,
            nextComponentId: nextComponentId + 1,
            selectedComponentId: newComponent.id,
        });
    },

    /**
     * Adds a new empty screen to the application.
     */
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

    /**
     * Updates the custom ID (used in generated code) for a specific screen.
     * Validates the ID for uniqueness and allowed characters.
     * @param {number} screenIndex - The index of the screen to update.
     * @param {string} newCustomId - The new custom ID.
     * @returns {boolean} True if the update was successful, false otherwise.
     */
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
        if (
            screens.some(
                (screen, idx) =>
                    idx !== screenIndex && screen.customId === newCustomId
            )
        ) {
            alert("Screen ID must be unique");
            return false;
        }
        const updatedScreens = [...screens];
        updatedScreens[screenIndex].customId = newCustomId;
        set({ screens: updatedScreens });
        return true;
    },

    /**
     * Deletes a screen and its components. Cannot delete the last screen.
     * @param {number} screenId - The ID of the screen to delete.
     */
    deleteScreen: (screenId) => {
        const { screens, currentScreenIndex } = get();
        if (screens.length <= 1) return;
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
    },

    /**
     * Deletes a component and all its descendants (if it's a Frame).
     * @param {number} id - The ID of the component to delete.
     */
    deleteComponent: (id) => {
        const { screens, currentScreenIndex, selectedComponentId } = get();
        const currentScreen = screens[currentScreenIndex];
        const components = currentScreen.components;
        const componentsToDelete = new Set([id]);
        const findDescendants = (parentId) => {
            components.forEach((comp) => {
                if (comp.parentId === parentId) {
                    componentsToDelete.add(comp.id);
                    if (comp.type === "PySideFrame") findDescendants(comp.id);
                }
            });
        };
        const componentToDelete = components.find((comp) => comp.id === id);
        if (componentToDelete?.type === "PySideFrame") findDescendants(id);

        const updatedScreens = screens.map((screen, idx) =>
            idx !== currentScreenIndex
                ? screen
                : {
                      ...screen,
                      components: screen.components.filter(
                          (c) => !componentsToDelete.has(c.id)
                      ),
                  }
        );
        set({
            screens: updatedScreens,
            selectedComponentId: componentsToDelete.has(selectedComponentId)
                ? null
                : selectedComponentId,
        });
    },

    /**
     * Updates the size and position of a component based on react-rnd output.
     * @param {number} id - The ID of the component to resize/reposition.
     * @param {object} newSizeAndPositionFromRnd - Object containing { width, height, x, y }.
     */
    resizeComponent: (id, newSizeAndPositionFromRnd) => {
        const { screens, currentScreenIndex } = get();
        const screen = screens[currentScreenIndex];
        const allComponents = screen.components;
        const resizedComponent = allComponents.find((comp) => comp.id === id);
        if (!resizedComponent) return;
        const { x, y, width, height } = newSizeAndPositionFromRnd;
        const updatedScreens = screens.map((s, idx) =>
            idx !== currentScreenIndex
                ? s
                : {
                      ...s,
                      components: s.components.map((component) =>
                          component.id === id
                              ? { ...component, width, height, x, y }
                              : component
                      ),
                  }
        );
        set({ screens: updatedScreens });
    },

    /**
     * Moves a component, potentially changing its parent if dropped over a Frame.
     * Calculates the new relative position based on drop location and parent changes.
     * @param {number} id - The ID of the component being moved.
     * @param {object} positionData - Object containing { relativePos: {x, y}, mouseEventCoords: {clientX, clientY} }.
     */
    moveComponent: (id, positionData) => {
        const { relativePos, mouseEventCoords } = positionData;
        const {
            screens,
            currentScreenIndex,
            _getAbsolutePosition,
            zoomLevel,
            panPosition,
        } = get();
        const screen = screens[currentScreenIndex];
        const allComponents = screen.components;
        const movedComponent = allComponents.find((comp) => comp.id === id);
        if (!movedComponent) return;

        const originalParentId = movedComponent.parentId;
        let finalParentId = null,
            finalRelativeX = 0,
            finalRelativeY = 0;

        // --- Parent Detection Logic using Mouse Coordinates ---
        const screenContainerRect = document
            .querySelector(".relative.mx-auto.origin-top-left")
            ?.getBoundingClientRect();
        let adjustedMouseX = NaN,
            adjustedMouseY = NaN;

        if (screenContainerRect && mouseEventCoords) {
            const mouseClientX = mouseEventCoords.clientX;
            const mouseClientY = mouseEventCoords.clientY;
            const mouseRelativeToContainerX =
                mouseClientX - screenContainerRect.left;
            const mouseRelativeToContainerY =
                mouseClientY - screenContainerRect.top;
            adjustedMouseX = mouseRelativeToContainerX - panPosition.x;
            adjustedMouseY = mouseRelativeToContainerY - panPosition.y;
        } else {
            console.warn(
                "Could not find screen container or mouse coords for adjustment. Parent detection might be inaccurate."
            );
            const lastAbsPos = _getAbsolutePosition(id, allComponents);
            if (!isNaN(lastAbsPos.x)) {
                adjustedMouseX =
                    lastAbsPos.x + relativePos.x - movedComponent.x;
                adjustedMouseY =
                    lastAbsPos.y + relativePos.y - movedComponent.y;
            } else {
                adjustedMouseX = relativePos.x;
                adjustedMouseY = relativePos.y;
            }
        }

        // Find potential parent frame under mouse
        const frames = allComponents.filter(
            (c) => c.type === "PySideFrame" && c.id !== id
        );
        let potentialParent = null;
        for (const frame of frames) {
            const frameAbsPos = _getAbsolutePosition(frame.id, allComponents);
            if (isNaN(frameAbsPos.x)) continue;
            if (
                adjustedMouseX >= frameAbsPos.x &&
                adjustedMouseX <= frameAbsPos.x + frame.width &&
                adjustedMouseY >= frameAbsPos.y &&
                adjustedMouseY <= frameAbsPos.y + frame.height
            ) {
                potentialParent = frame;
                break;
            }
        }
        // If not over any frame but inside screen, treat as main screen
        let isOnMainScreen =
            !potentialParent &&
            adjustedMouseX >= 0 &&
            adjustedMouseX <= screen.width &&
            adjustedMouseY >= 0 &&
            adjustedMouseY <= screen.height;

        const newParentId = potentialParent
            ? potentialParent.id
            : isOnMainScreen
              ? null
              : null;

        // --- Only set dropTargetFrameId for a short blink if parent is changing ---
        if (newParentId !== movedComponent.parentId) {
            set({
                dropTargetFrameId: potentialParent
                    ? potentialParent.id
                    : isOnMainScreen
                      ? -1
                      : null,
            });
            setTimeout(() => set({ dropTargetFrameId: null }), 700);
        }

        // --- Calculate Final Position ---
        if (newParentId !== movedComponent.parentId) {
            // Calculate position relative to the *new* parent
            if (newParentId !== null) {
                const newParentAbsPos = _getAbsolutePosition(
                    newParentId,
                    allComponents
                );
                if (!isNaN(newParentAbsPos.x)) {
                    finalRelativeX =
                        adjustedMouseX -
                        newParentAbsPos.x -
                        movedComponent.width / 2;
                    finalRelativeY =
                        adjustedMouseY -
                        newParentAbsPos.y -
                        movedComponent.height / 2;
                } else {
                    console.error(
                        `Could not get absolute position for new parent ${newParentId}`
                    );
                    finalRelativeX = relativePos.x; // Fallback
                    finalRelativeY = relativePos.y;
                }
            } else {
                finalRelativeX = adjustedMouseX - movedComponent.width / 2;
                finalRelativeY = adjustedMouseY - movedComponent.height / 2;
            }
        } else {
            // Moving within the same parent (or staying at top level)
            finalRelativeX = relativePos.x;
            finalRelativeY = relativePos.y;
        }

        // Clamp position to be within parent bounds if it's a frame
        if (newParentId !== null) {
            const parentFrame = allComponents.find((c) => c.id === newParentId);
            if (parentFrame) {
                finalRelativeX = Math.max(
                    0,
                    Math.min(
                        finalRelativeX,
                        parentFrame.width - movedComponent.width
                    )
                );
                finalRelativeY = Math.max(
                    0,
                    Math.min(
                        finalRelativeY,
                        parentFrame.height - movedComponent.height
                    )
                );
            }
        } else {
            finalRelativeX = Math.max(
                0,
                Math.min(finalRelativeX, screen.width - movedComponent.width)
            );
            finalRelativeY = Math.max(
                0,
                Math.min(finalRelativeY, screen.height - movedComponent.height)
            );
        }

        // --- Update state ---
        const updatedScreens = screens.map((s, idx) =>
            idx !== currentScreenIndex
                ? s
                : {
                      ...s,
                      components: s.components.map((component) =>
                          component.id === id
                              ? {
                                    ...component,
                                    x: Math.round(finalRelativeX),
                                    y: Math.round(finalRelativeY),
                                    parentId: newParentId,
                                }
                              : component
                      ),
                  }
        );
        set({ screens: updatedScreens });
    },

    /**
     * Updates specific properties of a component.
     * @param {number} id - The ID of the component to update.
     * @param {object} newProps - An object containing the properties to update.
     */
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

    /**
     * Updates the background color of a specific screen.
     * @param {number} screenIndex - The index of the screen to update.
     * @param {string} newColor - The new background color hex string.
     */
    updateScreenBackgroundColor: (screenIndex, newColor) => {
        const { screens } = get();
        const updatedScreens = [...screens];
        updatedScreens[screenIndex].backgroundColor = newColor;
        set({ screens: updatedScreens });
    },

    /**
     * Updates the width and/or height of a specific screen.
     * @param {number} screenIndex - The index of the screen to update.
     * @param {object} dimensions - Object containing { width, height }.
     */
    updateScreenDimensions: (screenIndex, dimensions) => {
        const { screens } = get();
        const updatedScreens = [...screens];
        if (dimensions.width)
            updatedScreens[screenIndex].width = dimensions.width;
        if (dimensions.height)
            updatedScreens[screenIndex].height = dimensions.height;
        set({ screens: updatedScreens });
    },

    /**
     * Sets the currently selected component ID.
     * @param {number | null} id - The ID of the component to select, or null to deselect.
     */
    selectComponent: (id) => set({ selectedComponentId: id }),

    /**
     * Duplicates the currently selected component and its children (if any).
     * Places the duplicate slightly offset from the original.
     */
    duplicateComponent: () => {
        const {
            selectedComponentId,
            screens,
            currentScreenIndex,
            nextComponentId,
        } = get();
        if (selectedComponentId === null) return;
        const currentScreen = screens[currentScreenIndex];
        const componentToDuplicate = currentScreen.components.find(
            (comp) => comp.id === selectedComponentId
        );
        if (!componentToDuplicate) return;

        let newNextComponentId = nextComponentId;
        const idMap = new Map();

        const duplicateRecursive = (originalComp, parentId) => {
            const newId = newNextComponentId++;
            idMap.set(originalComp.id, newId);
            const duplicatedComp = {
                ...JSON.parse(JSON.stringify(originalComp)),
                id: newId,
                parentId,
                x: originalComp.x + 20,
                y: originalComp.y + 20,
                componentId: `${originalComp.type.toLowerCase()}${newId}`,
            };
            let children = [];
            if (originalComp.type === "PySideFrame") {
                const originalChildren = currentScreen.components.filter(
                    (comp) => comp.parentId === originalComp.id
                );
                children = originalChildren.flatMap((child) =>
                    duplicateRecursive(child, newId)
                );
            }
            return [duplicatedComp, ...children];
        };

        const newComponents = duplicateRecursive(
            componentToDuplicate,
            componentToDuplicate.parentId
        );
        const updatedScreens = [...screens];
        updatedScreens[currentScreenIndex].components.push(...newComponents);

        set({
            screens: updatedScreens,
            nextComponentId: newNextComponentId,
            selectedComponentId: idMap.get(selectedComponentId),
        });
    },

    /**
     * Sets the index of the currently active screen.
     * @param {number} idx - The index of the screen to make current.
     */
    setCurrentScreenIndex: (idx) => set({ currentScreenIndex: idx }),

    /** Sets the zoom level for the center panel. */
    setZoomLevel: (zoom) => set({ zoomLevel: zoom }),
    /** Sets the pan position for the center panel. */
    setPanPosition: (pos) => set({ panPosition: pos }),
    /** Sets the panning state. */
    setIsPanning: (val) => set({ isPanning: val }),
    /** Sets the last recorded mouse position during panning. */
    setLastMousePosition: (pos) => set({ lastMousePosition: pos }),

    /** Increases the zoom level. */
    handleZoomIn: () => {
        const { zoomLevel, maxZoom } = get();
        set({ zoomLevel: Math.min(maxZoom, zoomLevel + 0.1) });
    },
    /** Decreases the zoom level. */
    handleZoomOut: () => {
        const { zoomLevel, minZoom } = get();
        set({ zoomLevel: Math.max(minZoom, zoomLevel - 0.1) });
    },
    /** Handles mouse wheel events for zooming (if Ctrl is pressed). */
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
    /** Starts panning when the middle mouse button or Alt key is pressed. */
    handlePanStart: (e) => {
        if (e.button === 1 || e.altKey) {
            set({
                isPanning: true,
                lastMousePosition: { x: e.clientX, y: e.clientY },
            });
            e.preventDefault();
        }
    },
    /** Updates the pan position based on mouse movement while panning. */
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
    /** Stops the panning state. */
    handlePanEnd: () => set({ isPanning: false }),
    /** Resets zoom and pan to default values. */
    handleResetView: () => set({ panPosition: { x: 0, y: 0 }, zoomLevel: 1 }),

    /**
     * Exports the current design as a zip file containing the .ui file and a Python loader script.
     * @param {object} centerPanelDimensions - Dimensions used for UI file generation (may not be needed).
     */
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

    /**
     * Exports the current design state as a .ui file.
     */
    handleSaveToUiFile: () => {
        const { screens, currentScreenIndex } = get();
        exportToUiFile(screens, currentScreenIndex);
    },

    /**
     * Loads a design state from a .ui file.
     * @param {File} file - The .ui file to load.
     * @returns {Promise<void>} A promise that resolves when loading is complete or rejects on error.
     */
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
