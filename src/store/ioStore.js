import { generatePythonLoaderCode, generateQtUiFile } from "../utils/generatePySideCode";
import { exportToUiFile, importFromUiFile } from "../utils/saveSystem";
import JSZip from "jszip";

export const createIoSlice = (set, get) => ({
    handleExport: async (centerPanelDimensions) => {
        const { screens, currentScreenIndex } = get(); // from screenStore
        const uiFile = generateQtUiFile(
            screens,
            currentScreenIndex,
            centerPanelDimensions // This might be from UI, not store
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
        const { screens, currentScreenIndex } = get(); // from screenStore
        exportToUiFile(screens, currentScreenIndex);
    },

    handleLoadFromUiFile: async (file) => {
        try {
            const appState = await importFromUiFile(file);
            if (!appState.screens || !Array.isArray(appState.screens)) {
                throw new Error("Invalid file format: missing screens array");
            }
            // Update states in other slices
            set({
                // screenStore state
                screens: appState.screens,
                nextScreenId: appState.nextScreenId || appState.screens.length,
                currentScreenIndex: Math.min(
                    appState.currentScreenIndex || 0,
                    appState.screens.length - 1
                ),
                // componentStore state
                nextComponentId: appState.nextComponentId || 0, // Ensure there's a default
                selectedComponentId: null,
                // canvasStore state (resetting zoom/pan)
                zoomLevel: 1,
                panPosition: { x: 0, y: 0 },
                // interactionsStore state (resetting)
                isPanning: false,
                dropTargetFrameId: null,
            });
        } catch (error) {
            alert(`Error loading design: ${error.message}`);
            console.error("Import error:", error);
        }
    },
});
