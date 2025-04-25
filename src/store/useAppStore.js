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
            adjustedMouseX =
                (mouseRelativeToContainerX - panPosition.x) / zoomLevel;
            adjustedMouseY =
                (mouseRelativeToContainerY - panPosition.y) / zoomLevel;
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
        finalParentId = potentialParent ? potentialParent.id : null;

        // --- Calculate Final Position ---
        if (finalParentId !== originalParentId) {
            if (finalParentId !== null && potentialParent) {
                // Moved INTO a frame
                const newParentAbsPos = _getAbsolutePosition(
                    finalParentId,
                    allComponents
                );
                const originalParentAbsPos = originalParentId
                    ? _getAbsolutePosition(originalParentId, allComponents)
                    : { x: 0, y: 0 };
                if (
                    !isNaN(newParentAbsPos.x) &&
                    !isNaN(originalParentAbsPos.x)
                ) {
                    const deltaX = originalParentAbsPos.x - newParentAbsPos.x;
                    const deltaY = originalParentAbsPos.y - newParentAbsPos.y;
                    finalRelativeX = relativePos.x + deltaX;
                    finalRelativeY = relativePos.y + deltaY;
                } else {
                    finalRelativeX = relativePos.x;
                    finalRelativeY = relativePos.y;
                }
            } else if (originalParentId !== null && finalParentId === null) {
                finalRelativeX = adjustedMouseX - movedComponent.width / 2;
                finalRelativeY = adjustedMouseY - movedComponent.height / 2;
            } else {
                finalRelativeX = relativePos.x;
                finalRelativeY = relativePos.y;
            }
        } else {
            finalRelativeX = relativePos.x;
            finalRelativeY = relativePos.y;
        }

        if (finalParentId !== null && finalParentId === originalParentId) {
            finalRelativeX = Math.max(0, finalRelativeX);
            finalRelativeY = Math.max(0, finalRelativeY);
        }

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
                                    parentId: finalParentId,
                                }
                              : component
                      ),
                  }
        );
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

    setCurrentScreenIndex: (idx) => set({ currentScreenIndex: idx }),

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
