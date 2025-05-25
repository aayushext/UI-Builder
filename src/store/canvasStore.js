export const createCanvasSlice = (set, get) => ({
    zoomLevel: 1,
    minZoom: 0.1,
    maxZoom: 3,
    panPosition: { x: 0, y: 0 },

    setZoomLevel: (zoom) => set({ zoomLevel: Math.max(get().minZoom, Math.min(get().maxZoom, zoom)) }),
    setPanPosition: (pos) => set({ panPosition: pos }),

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
    handleResetView: () => set({ panPosition: { x: 0, y: 0 }, zoomLevel: 1 }),
});
