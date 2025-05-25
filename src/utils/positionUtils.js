/**
 * Calculates the absolute screen position of a component, traversing its parent hierarchy.
 * @param {number} componentId - The ID of the component.
 * @param {Array} allComponents - The array of all components in the current screen.
 * @returns {{x: number, y: number}} The absolute position, or {x: NaN, y: NaN} if error.
 */
export const getAbsolutePosition = (componentId, allComponents) => {
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
};
