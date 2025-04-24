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
        let absX = 0;
        let absY = 0;
        let current = allComponents.find((c) => c.id === componentId);
        const stack = new Set(); // Cycle detection

        while (current) {
            if (stack.has(current.id)) break; // Cycle detected
            stack.add(current.id);

            absX += current.x;
            absY += current.y;

            if (current.parentId === null) break; // Reached top level
            const parent = allComponents.find((c) => c.id === current.parentId);
            if (!parent) break; // Parent not found
            current = parent;
        }
        // If the loop broke due to cycle, the position might be wrong.
        // The calculation sums relative positions up the tree.

        return { x: absX, y: absY };
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

    moveComponent: (id, positionFromRnd) => {
        // positionFromRnd is the final {x, y} relative to the DOM parent from Rnd's onDragStop
        const { screens, currentScreenIndex, _getAbsolutePosition } = get();
        const screen = screens[currentScreenIndex];
        const allComponents = screen.components;
        const movedComponent = allComponents.find((comp) => comp.id === id);

        if (!movedComponent) return;

        let finalParentId = null;
        let finalRelativeX = positionFromRnd.x; // Default: Rnd pos is screen-relative
        let finalRelativeY = positionFromRnd.y; // Default: Rnd pos is screen-relative
        let potentialParent = null;

        // --- Parent Detection Logic (Still needs Absolute Coords) ---
        // Calculate the component's *absolute* center position *at the end of the drag*
        // This is tricky because positionFromRnd is relative to the *final* DOM parent.
        // We need to know the absolute position to check against frames' absolute bounds.
        // Let's approximate the absolute position for the check.
        // A more robust way might involve getting the element's bounding rect, but let's try this first.

        // Get the absolute position of the component *before* the move started
        const originalAbsPos = _getAbsolutePosition(id, allComponents);
        // Estimate the final absolute position for the check (this might be slightly off if parent changed)
        // A better check might involve using the mouse event coordinates if available.
        // For now, let's use the Rnd position added to an *estimated* parent absolute position.
        // This part is complex. Let's simplify the check: Assume positionFromRnd is close enough to absolute for the check if it was top-level,
        // or add its original parent's abs pos if it was nested. This is still an approximation.

        // Let's try a simpler approach for the check: Use the absolute position helper on the *potential parent*
        // and compare it with an *estimated* absolute position of the moved component.

        // Estimate the final absolute position for the center check
        let estimatedFinalAbsX = positionFromRnd.x;
        let estimatedFinalAbsY = positionFromRnd.y;
        if (movedComponent.parentId !== null) {
            const originalParentAbsPos = _getAbsolutePosition(
                movedComponent.parentId,
                allComponents
            );
            if (!isNaN(originalParentAbsPos.x)) {
                estimatedFinalAbsX += originalParentAbsPos.x;
                estimatedFinalAbsY += originalParentAbsPos.y;
            }
        }
        // If the component was just dropped onto the screen, positionFromRnd *is* the absolute position.
        // If it was dropped into a frame, positionFromRnd is relative to that frame.
        // The check needs the component's final absolute position.

        console.log(
            `moveComponent START: ID=${id}, RndPos=${JSON.stringify(positionFromRnd)}, OriginalParentID=${movedComponent.parentId}`
        );

        const frames = allComponents.filter(
            (c) => c.type === "PySideFrame" && c.id !== id
        );
        for (const frame of frames) {
            const frameAbsPos = _getAbsolutePosition(frame.id, allComponents);
            if (isNaN(frameAbsPos.x)) continue;

            // Calculate the component's *absolute* center using Rnd's position relative to its *final* parent
            // To do this accurately, we need the final parent's absolute position *first*.
            // Let's assume the component *might* be in this frame and calculate its potential absolute center.
            const potentialAbsCenterX =
                frameAbsPos.x + positionFromRnd.x + movedComponent.width / 2;
            const potentialAbsCenterY =
                frameAbsPos.y + positionFromRnd.y + movedComponent.height / 2;

            // Check if this potential absolute center falls within the frame's absolute bounds
            if (
                potentialAbsCenterX >= frameAbsPos.x &&
                potentialAbsCenterX <= frameAbsPos.x + frame.width &&
                potentialAbsCenterY >= frameAbsPos.y &&
                potentialAbsCenterY <= frameAbsPos.y + frame.height
            ) {
                // If the check passes, assume this frame is the parent
                potentialParent = frame;
                console.log(
                    `moveComponent: Found potential parent Frame ID=${frame.id} at AbsPos=${JSON.stringify(frameAbsPos)}`
                );
                break;
            }
        }
        // If no parent frame was found by the check above, maybe it landed on the screen.
        // Check if its Rnd position (which would be screen-relative) is outside all frames.
        if (!potentialParent) {
            const screenLevelAbsCenterX =
                positionFromRnd.x + movedComponent.width / 2;
            const screenLevelAbsCenterY =
                positionFromRnd.y + movedComponent.height / 2;
            let insideAnyFrame = false;
            for (const frame of frames) {
                const frameAbsPos = _getAbsolutePosition(
                    frame.id,
                    allComponents
                );
                if (isNaN(frameAbsPos.x)) continue;
                if (
                    screenLevelAbsCenterX >= frameAbsPos.x &&
                    screenLevelAbsCenterX <= frameAbsPos.x + frame.width &&
                    screenLevelAbsCenterY >= frameAbsPos.y &&
                    screenLevelAbsCenterY <= frameAbsPos.y + frame.height
                ) {
                    insideAnyFrame = true;
                    // This case is tricky - Rnd reported screen-relative coords, but it's inside a frame.
                    // This implies the parent *should* be this frame. Let's assign it.
                    potentialParent = frame;
                    console.log(
                        `moveComponent: Corrected parent to Frame ID=${frame.id} based on screen-relative check.`
                    );
                    break;
                }
            }
        }

        // --- Parent Check Done ---

        if (potentialParent) {
            finalParentId = potentialParent.id;
            // The positionFromRnd is already relative to this parent frame's DOM node. Store it directly.
            finalRelativeX = positionFromRnd.x;
            finalRelativeY = positionFromRnd.y;
            console.log(
                `moveComponent (In Frame): Storing RndPos directly as RelativePos=${JSON.stringify({ x: finalRelativeX, y: finalRelativeY })}`
            );
        } else {
            // No parent frame found, the positionFromRnd is relative to the screen container. Store it directly.
            finalParentId = null;
            finalRelativeX = positionFromRnd.x;
            finalRelativeY = positionFromRnd.y;
            console.log(
                `moveComponent (Screen): Storing RndPos directly as Screen Relative Pos=${JSON.stringify({ x: finalRelativeX, y: finalRelativeY })}`
            );
        }

        // Update state...
        const updatedScreens = screens.map((s, index) => {
            if (index !== currentScreenIndex) return s;
            return {
                ...s,
                components: s.components.map((component) =>
                    component.id === id
                        ? {
                              ...component,
                              x: finalRelativeX, // Store final relative X
                              y: finalRelativeY, // Store final relative Y
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
