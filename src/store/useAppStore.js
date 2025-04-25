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

    // Helper function within the store to get a component's absolute position
    _getAbsolutePosition: (componentId, allComponents) => {
        let totalX = 0;
        let totalY = 0;
        let currentId = componentId;
        const visited = new Set(); // Cycle detection

        while (currentId !== null) {
            if (visited.has(currentId)) {
                console.error(
                    "Cycle detected in parent hierarchy for ID:",
                    componentId
                );
                return { x: NaN, y: NaN }; // Indicate error
            }
            visited.add(currentId);

            const currentComp = allComponents.find((c) => c.id === currentId);
            if (!currentComp) {
                console.error(
                    "Component not found during absolute position calculation for ID:",
                    currentId
                );
                return { x: NaN, y: NaN }; // Indicate error
            }

            totalX += currentComp.x;
            totalY += currentComp.y;

            currentId = currentComp.parentId;
        }
        return { x: totalX, y: totalY };
    },

    // Actions
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

        let parentId = null;
        let position = { x: 50, y: 50 }; // Default position on screen
        let parentComponent = null; // Keep track of the parent frame if found

        // If a component is selected and it's a frame, add the new component inside it
        if (selectedComponent && selectedComponent.type === "PySideFrame") {
            parentId = selectedComponent.id;
            parentComponent = selectedComponent; // Store the parent frame
            position = { x: 10, y: 10 }; // Default position inside frame
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
        newComponent.parentId = parentId; // Set the parentId

        const updatedScreens = [...screens];
        updatedScreens[currentScreenIndex].components.push(newComponent);
        set({
            screens: updatedScreens,
            nextComponentId: nextComponentId + 1,
            selectedComponentId: newComponent.id, // Select the newly added component
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
        const { screens, currentScreenIndex, selectedComponentId } = get();
        const currentScreen = screens[currentScreenIndex];
        const components = currentScreen.components;

        // Find all components to delete (the component itself and all its descendants)
        const componentsToDelete = new Set([id]);
        const findDescendants = (parentId) => {
            components.forEach((comp) => {
                if (comp.parentId === parentId) {
                    componentsToDelete.add(comp.id);
                    if (comp.type === "PySideFrame") {
                        findDescendants(comp.id);
                    }
                }
            });
        };

        const componentToDelete = components.find((comp) => comp.id === id);
        if (componentToDelete && componentToDelete.type === "PySideFrame") {
            findDescendants(id);
        }

        const updatedScreens = screens.map((screen, index) => {
            if (index !== currentScreenIndex) return screen;
            return {
                ...screen,
                components: screen.components.filter(
                    (component) => !componentsToDelete.has(component.id)
                ),
            };
        });

        set({
            screens: updatedScreens,
            selectedComponentId: componentsToDelete.has(selectedComponentId)
                ? null
                : selectedComponentId,
        });
    },

    resizeComponent: (id, newSizeAndPositionFromRnd) => {
        // newSizeAndPositionFromRnd contains width, height, and x, y relative to DOM parent from Rnd
        const { screens, currentScreenIndex } = get();
        const screen = screens[currentScreenIndex];
        const allComponents = screen.components;
        const resizedComponent = allComponents.find((comp) => comp.id === id);

        if (!resizedComponent) return;

        // The parent doesn't change during resize.
        // The position reported by Rnd (newSizeAndPositionFromRnd.x/y) is already relative
        // to the DOM parent (either the screen container or the parent frame's div).
        // We can store this directly.
        const finalRelativeX = newSizeAndPositionFromRnd.x;
        const finalRelativeY = newSizeAndPositionFromRnd.y;

        console.log(
            `resizeComponent: ID=${id}, RndPos=${JSON.stringify({ x: finalRelativeX, y: finalRelativeY })}, Size=${JSON.stringify({ w: newSizeAndPositionFromRnd.width, h: newSizeAndPositionFromRnd.height })}`
        );

        const updatedScreens = screens.map((s, index) => {
            if (index !== currentScreenIndex) return s;
            return {
                ...s,
                components: s.components.map((component) =>
                    component.id === id
                        ? {
                              ...component,
                              width: newSizeAndPositionFromRnd.width,
                              height: newSizeAndPositionFromRnd.height,
                              x: finalRelativeX, // Store relative X directly from Rnd
                              y: finalRelativeY, // Store relative Y directly from Rnd
                              // parentId remains unchanged
                          }
                        : component
                ),
            };
        });
        set({ screens: updatedScreens });
    },

    moveComponent: (id, positionData) => {
        // positionData contains { relativePos: {x, y}, mouseEventCoords: {clientX, clientY} }
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

        let finalParentId = null;
        let finalRelativeX = 0;
        let finalRelativeY = 0;
        let potentialParent = null;
        const originalParentId = movedComponent.parentId; // Store original parent ID

        console.log(
            `moveComponent START: ID=${id}, RndRelPos=${JSON.stringify(relativePos)}, MouseCoords=${JSON.stringify(mouseEventCoords)}, OriginalParentID=${originalParentId}`
        );

        // --- Parent Detection Logic using Mouse Coordinates ---
        // (Keep the existing logic using adjustedMouseX/Y for accurate parent detection)
        const screenContainerRect = document
            .querySelector(".relative.mx-auto.origin-top-left")
            ?.getBoundingClientRect();
        let adjustedMouseX = NaN;
        let adjustedMouseY = NaN;

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
            // console.log(
            //     `Adjusted Mouse Coords (relative to screen origin): x=${adjustedMouseX}, y=${adjustedMouseY}`
            // );
        } else {
            console.warn(
                "Could not find screen container or mouse coords for adjustment. Parent detection might be inaccurate."
            );
            // Fallback (less accurate) - Use component's last known absolute position for check
            const lastAbsPos = _getAbsolutePosition(id, allComponents);
            if (!isNaN(lastAbsPos.x)) {
                adjustedMouseX =
                    lastAbsPos.x + relativePos.x - movedComponent.x; // Approximate based on delta
                adjustedMouseY =
                    lastAbsPos.y + relativePos.y - movedComponent.y;
            } else {
                // Absolute fallback if everything fails
                adjustedMouseX = relativePos.x;
                adjustedMouseY = relativePos.y;
            }
        }

        const checkX = adjustedMouseX;
        const checkY = adjustedMouseY;

        const frames = allComponents.filter(
            (c) => c.type === "PySideFrame" && c.id !== id
        );
        for (const frame of frames) {
            const frameAbsPos = _getAbsolutePosition(frame.id, allComponents);
            if (isNaN(frameAbsPos.x)) continue;

            if (
                checkX >= frameAbsPos.x &&
                checkX <= frameAbsPos.x + frame.width &&
                checkY >= frameAbsPos.y &&
                checkY <= frameAbsPos.y + frame.height
            ) {
                potentialParent = frame;
                // console.log(
                //     `moveComponent: Mouse landed in Frame ID=${frame.id} at AbsPos=${JSON.stringify(frameAbsPos)}`
                // );
                break;
            }
        }
        // --- Parent Check Done ---

        // Determine final parent ID
        finalParentId = potentialParent ? potentialParent.id : null;

        // --- Calculate Final Position ---
        if (finalParentId !== originalParentId) {
            // Parent has changed OR component moved to/from screen
            if (finalParentId !== null && potentialParent) {
                // Moved INTO a frame (from screen or another frame)
                const newParentAbsPos = _getAbsolutePosition(
                    finalParentId,
                    allComponents
                );
                const originalParentAbsPos = originalParentId
                    ? _getAbsolutePosition(originalParentId, allComponents)
                    : { x: 0, y: 0 }; // Origin if moved from screen

                if (
                    !isNaN(newParentAbsPos.x) &&
                    !isNaN(originalParentAbsPos.x)
                ) {
                    // Calculate the difference in parent origins
                    const deltaX = originalParentAbsPos.x - newParentAbsPos.x;
                    const deltaY = originalParentAbsPos.y - newParentAbsPos.y;

                    // Adjust the RND relative position by the delta
                    // This assumes relativePos is relative to the *original* parent container space
                    finalRelativeX = relativePos.x + deltaX;
                    finalRelativeY = relativePos.y + deltaY;
                    console.log(
                        `moveComponent (Into Frame): Parent changed. Delta=${JSON.stringify({ x: deltaX, y: deltaY })}, RndRelPos=${JSON.stringify(relativePos)}, FinalRelPos=${JSON.stringify({ x: finalRelativeX, y: finalRelativeY })}`
                    );
                } else {
                    console.warn(
                        "Could not get parent positions for delta calculation. Falling back to RndRelPos."
                    );
                    finalRelativeX = relativePos.x; // Fallback
                    finalRelativeY = relativePos.y; // Fallback
                }
            } else {
                // Moved TO screen (finalParentId is null)
                // RndRelPos should already be screen-relative
                finalRelativeX = relativePos.x;
                finalRelativeY = relativePos.y;
                console.log(
                    `moveComponent (To Screen): Using RndRelPos directly=${JSON.stringify({ x: finalRelativeX, y: finalRelativeY })}`
                );
            }
        } else {
            // Parent did NOT change (moved within screen or within the same frame)
            // RndRelPos is relative to the current parent, use directly.
            finalRelativeX = relativePos.x;
            finalRelativeY = relativePos.y;
            console.log(
                `moveComponent (No Parent Change): Using RndRelPos directly=${JSON.stringify({ x: finalRelativeX, y: finalRelativeY })}`
            );
        }

        // Ensure coordinates are not negative (relative to the determined parent)
        finalRelativeX = Math.max(0, finalRelativeX);
        finalRelativeY = Math.max(0, finalRelativeY);

        // Update state...
        const updatedScreens = screens.map((s, index) => {
            if (index !== currentScreenIndex) return s;
            return {
                ...s,
                components: s.components.map((component) =>
                    component.id === id
                        ? {
                              ...component,
                              x: Math.round(finalRelativeX), // Store final relative X
                              y: Math.round(finalRelativeY), // Store final relative Y
                              parentId: finalParentId, // Update parentId
                          }
                        : component
                ),
            };
        });
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
            nextComponentId: currentNextComponentId,
        } = get();

        if (selectedComponentId === null) return;

        const currentScreen = screens[currentScreenIndex];
        const componentToDuplicate = currentScreen.components.find(
            (comp) => comp.id === selectedComponentId
        );

        if (!componentToDuplicate) return;

        let newNextComponentId = currentNextComponentId;
        const idMap = new Map(); // Maps old IDs to new IDs

        // Recursive function to duplicate a component and its children
        const duplicateRecursive = (originalComp, parentId) => {
            const newId = newNextComponentId++;
            idMap.set(originalComp.id, newId);

            const duplicatedComp = {
                ...JSON.parse(JSON.stringify(originalComp)),
                id: newId,
                parentId: parentId, // Use the new parent ID if applicable
                x: originalComp.x + 20, // Offset duplicate slightly
                y: originalComp.y + 20,
                componentId: `${originalComp.type.toLowerCase()}${newId}`, // Ensure unique componentId
            };

            let children = [];
            if (originalComp.type === "PySideFrame") {
                const originalChildren = currentScreen.components.filter(
                    (comp) => comp.parentId === originalComp.id
                );
                children = originalChildren.flatMap((child) =>
                    duplicateRecursive(child, newId)
                ); // Pass new parent ID
            }

            return [duplicatedComp, ...children];
        };

        const newComponents = duplicateRecursive(
            componentToDuplicate,
            componentToDuplicate.parentId // Keep the same parent initially
        );

        const updatedScreens = [...screens];
        updatedScreens[currentScreenIndex].components.push(...newComponents);

        set({
            screens: updatedScreens,
            nextComponentId: newNextComponentId,
            selectedComponentId: idMap.get(selectedComponentId), // Select the top-level duplicated component
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
