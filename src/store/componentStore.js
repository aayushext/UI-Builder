import { createComponent } from "../utils/componentLoader";
import { getAbsolutePosition } from "../utils/positionUtils";

export const createComponentSlice = (set, get) => ({
    nextComponentId: 0,
    selectedComponentId: null,

    addComponent: (type) => {
        const { screens, currentScreenIndex, nextComponentId, selectedComponentId } = get();
        const currentScreen = screens[currentScreenIndex];
        const currentScreenComponents = currentScreen?.components || [];
        const selectedComponent = currentScreenComponents.find(
            (c) => c.id === selectedComponentId
        );

        let parentId = null,
            position = { x: 50, y: 50 };
        if (selectedComponent?.type === "PySideFrame") {
            parentId = selectedComponent.id;
            position = { x: 10, y: 10 };
        }

        const newComponent = createComponent(type, nextComponentId, position);
        newComponent.parentId = parentId;

        const updatedScreens = screens.map((s, idx) =>
            idx === currentScreenIndex
                ? { ...s, components: [...(s.components || []), newComponent] }
                : s
        );

        set({
            screens: updatedScreens, // Update screenStore's part of the state
            nextComponentId: nextComponentId + 1,
            selectedComponentId: newComponent.id,
        });
    },

    deleteComponent: (id) => {
        const { screens, currentScreenIndex, selectedComponentId } = get();
        const currentScreen = screens[currentScreenIndex];
        if (!currentScreen || !currentScreen.components) return;
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
        if (componentToDelete?.type === "PySideFrame") {
            findDescendants(id);
        }

        const updatedScreens = screens.map((s, idx) =>
            idx === currentScreenIndex
                ? { ...s, components: s.components.filter((c) => !componentsToDelete.has(c.id)) }
                : s
        );

        set({
            screens: updatedScreens, // Update screenStore's part of the state
            selectedComponentId: componentsToDelete.has(selectedComponentId)
                ? null
                : selectedComponentId,
        });
    },

    resizeComponent: (id, newSizeAndPositionFromRnd) => {
        const { screens, currentScreenIndex } = get();
        const { x, y, width, height } = newSizeAndPositionFromRnd;

        const updatedScreens = screens.map((s, idx) =>
            idx === currentScreenIndex && s.components
                ? {
                      ...s,
                      components: s.components.map((component) =>
                          component.id === id
                              ? { ...component, width, height, x, y }
                              : component
                      ),
                  }
                : s
        );
        set({ screens: updatedScreens }); // Update screenStore's part of the state
    },

    moveComponent: (id, positionData) => {
        const { relativePos, mouseEventCoords } = positionData;
        const { screens, currentScreenIndex, zoomLevel, updateDropTargetFrameId } = get(); // zoomLevel from canvas, updateDropTargetFrameId from interactions
        const screen = screens[currentScreenIndex];
        if (!screen || !screen.components) return;
        const allComponents = screen.components;
        const movedComponent = allComponents.find((comp) => comp.id === id);

        if (!movedComponent) return;

        let finalRelativeX = 0, finalRelativeY = 0;
        const screenContainerRect = document.querySelector(".relative.mx-auto.origin-top-left")?.getBoundingClientRect();
        let adjustedMouseX = NaN, adjustedMouseY = NaN;

        if (screenContainerRect && mouseEventCoords) {
            const mouseXInViewportOfScreen = mouseEventCoords.clientX - screenContainerRect.left;
            const mouseYInViewportOfScreen = mouseEventCoords.clientY - screenContainerRect.top;
            adjustedMouseX = mouseXInViewportOfScreen / zoomLevel;
            adjustedMouseY = mouseYInViewportOfScreen / zoomLevel;
        } else {
            const lastAbsPos = getAbsolutePosition(id, allComponents);
            if (!isNaN(lastAbsPos.x)) {
                adjustedMouseX = lastAbsPos.x + relativePos.x - movedComponent.x;
                adjustedMouseY = lastAbsPos.y + relativePos.y - movedComponent.y;
            } else {
                adjustedMouseX = relativePos.x;
                adjustedMouseY = relativePos.y;
            }
        }

        const frames = allComponents.filter((c) => c.type === "PySideFrame" && c.id !== id);
        let potentialParent = null;
        for (const frame of frames) {
            const frameAbsPos = getAbsolutePosition(frame.id, allComponents);
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
        let isOnMainScreen = !potentialParent && adjustedMouseX >= 0 && adjustedMouseX <= screen.width && adjustedMouseY >= 0 && adjustedMouseY <= screen.height;
        const newParentId = potentialParent ? potentialParent.id : isOnMainScreen ? null : movedComponent.parentId; // Keep current parent if not dropped on a valid target

        if (updateDropTargetFrameId) { // updateDropTargetFrameId is in interactionsStore
           if (newParentId !== movedComponent.parentId) {
                updateDropTargetFrameId(potentialParent ? potentialParent.id : isOnMainScreen ? -1 : null);
                setTimeout(() => updateDropTargetFrameId(null), 700);
            } else {
               updateDropTargetFrameId(null); // Clear if not changing parent or no valid target
           }
        }


        if (newParentId !== movedComponent.parentId) {
            if (newParentId !== null) { // New parent is a frame
                const newParentAbsPos = getAbsolutePosition(newParentId, allComponents);
                if (!isNaN(newParentAbsPos.x)) {
                    finalRelativeX = adjustedMouseX - newParentAbsPos.x - (movedComponent.width / 2);
                    finalRelativeY = adjustedMouseY - newParentAbsPos.y - (movedComponent.height / 2);
                } else { // Fallback if new parent pos calculation fails
                    finalRelativeX = relativePos.x; finalRelativeY = relativePos.y;
                }
            } else { // New parent is the screen itself
                finalRelativeX = adjustedMouseX - (movedComponent.width / 2);
                finalRelativeY = adjustedMouseY - (movedComponent.height / 2);
            }
        } else { // Moving within the same parent (or staying at top level)
            finalRelativeX = relativePos.x;
            finalRelativeY = relativePos.y;
        }

        // Clamp position
        if (newParentId !== null) { // Parent is a frame
            const parentFrame = allComponents.find((c) => c.id === newParentId);
            if (parentFrame) {
                finalRelativeX = Math.max(0, Math.min(finalRelativeX, parentFrame.width - movedComponent.width));
                finalRelativeY = Math.max(0, Math.min(finalRelativeY, parentFrame.height - movedComponent.height));
            }
        } else { // Parent is the screen
            finalRelativeX = Math.max(0, Math.min(finalRelativeX, screen.width - movedComponent.width));
            finalRelativeY = Math.max(0, Math.min(finalRelativeY, screen.height - movedComponent.height));
        }

        const updatedScreens = screens.map((s, idx) =>
            idx === currentScreenIndex
                ? {
                      ...s,
                      components: s.components.map((component) =>
                          component.id === id
                              ? { ...component, x: Math.round(finalRelativeX), y: Math.round(finalRelativeY), parentId: newParentId }
                              : component
                      ),
                  }
                : s
        );
        set({ screens: updatedScreens }); // Update screenStore's part of the state
    },

    updateComponentProps: (id, newProps) => {
        const { screens, currentScreenIndex } = get();
        const updatedScreens = screens.map((s, idx) =>
            idx === currentScreenIndex && s.components
                ? {
                      ...s,
                      components: s.components.map((component) =>
                          component.id === id ? { ...component, ...newProps } : component
                      ),
                  }
                : s
        );
        set({ screens: updatedScreens }); // Update screenStore's part of the state
    },

    selectComponent: (id) => {
        set({ selectedComponentId: id });
    },

    duplicateComponent: () => {
        const { screens, currentScreenIndex, selectedComponentId, nextComponentId } = get();
        if (selectedComponentId === null) return;

        const currentScreen = screens[currentScreenIndex];
        if (!currentScreen || !currentScreen.components) return;
        const componentToDuplicate = currentScreen.components.find(
            (comp) => comp.id === selectedComponentId
        );
        if (!componentToDuplicate) return;

        let newNextComponentId = nextComponentId;
        const idMap = new Map();

        const duplicateRecursive = (originalComp, parentIdForDuplicate) => {
            const newId = newNextComponentId++;
            idMap.set(originalComp.id, newId);
            const duplicatedComp = {
                ...JSON.parse(JSON.stringify(originalComp)),
                id: newId,
                parentId: parentIdForDuplicate,
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

        const newComponents = duplicateRecursive(componentToDuplicate, componentToDuplicate.parentId);

        const updatedScreens = screens.map((s, idx) =>
            idx === currentScreenIndex
                ? { ...s, components: [...s.components, ...newComponents] }
                : s
        );

        set({
            screens: updatedScreens, // Update screenStore's part of the state
            nextComponentId: newNextComponentId,
            selectedComponentId: idMap.get(selectedComponentId),
        });
    },
});
