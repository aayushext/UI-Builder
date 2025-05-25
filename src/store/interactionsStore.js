export const createInteractionsSlice = (set, get) => ({
    dropTargetFrameId: null,
    isPanning: false,
    lastMousePosition: { x: 0, y: 0 },

    updateDropTargetFrameId: (frameId) => set({ dropTargetFrameId: frameId }),
    setIsPanning: (val) => set({ isPanning: val }),
    setLastMousePosition: (pos) => set({ lastMousePosition: pos }),

    handlePanStart: (e) => {
        if (e.button === 1 || e.altKey) { // Middle mouse button or Alt key
            set({
                isPanning: true,
                lastMousePosition: { x: e.clientX, y: e.clientY },
            });
            e.preventDefault();
        }
    },
    handlePanMove: (e) => {
        const { isPanning, lastMousePosition } = get(); // Local state
        const { panPosition, setPanPosition } = get(); // From canvasStore

        if (isPanning) {
            const deltaX = e.clientX - lastMousePosition.x;
            const deltaY = e.clientY - lastMousePosition.y;

            if (setPanPosition && typeof setPanPosition === 'function') {
                setPanPosition({ // Call action from canvasStore
                    x: panPosition.x + deltaX,
                    y: panPosition.y + deltaY,
                });
            }
            set({ lastMousePosition: { x: e.clientX, y: e.clientY } }); // Update local state
            e.preventDefault();
        }
    },
    handlePanEnd: () => set({ isPanning: false }),
});
