import { useRef, useState } from "react";
import { getComponentDefinitions } from "../utils/componentLoader";
import { useUIStore } from "../store/StateStore";
import { exportToUiFile, importFromUiFile } from "../utils/saveSystem";
import {
    generatePythonLoaderCode,
    generateQtUiFile,
} from "../utils/generatePySideCode";
import JSZip from "jszip";

const LeftPanel = () => {
    const fileInputRef = useRef(null);
    const [isUiFileLoaded, setIsUiFileLoaded] = useState(false);
    const componentDefinitions = getComponentDefinitions();

    // Get actions directly from store
    const { addComponent, screens, currentScreenIndex, setAppState } =
        useUIStore();

    const handleExport = async () => {
        const uiFile = generateQtUiFile(screens, currentScreenIndex);
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
    };

    const handleSaveToUiFile = () => {
        exportToUiFile(screens, currentScreenIndex);
    };

    const handleLoadFromUiFile = async (file) => {
        try {
            const appState = await importFromUiFile(file);

            if (!appState.screens || !Array.isArray(appState.screens)) {
                throw new Error("Invalid file format: missing screens array");
            }

            setAppState(appState);
        } catch (error) {
            alert(`Error loading design: ${error.message}`);
            console.error("Import error:", error);
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            handleLoadFromUiFile(file);
            setIsUiFileLoaded(true);
        }
        event.target.value = "";
    };

    return (
        <aside className="w-64 bg-gray-200 dark:bg-gray-800 p-4 flex flex-col h-full flex-shrink-0">
            <div className="flex-1">
                <h2 className="text-lg font-bold mb-2">Components</h2>

                {/* Dynamically generate component buttons */}
                {componentDefinitions.map((component) => (
                    <button
                        key={component.type}
                        onClick={() => addComponent(component.type)}
                        className="bg-blue-500 hover:bg-blue-700 text-white dark:text-gray-200 font-bold py-2 px-4 rounded mt-4 w-full">
                        Add {component.displayName}
                    </button>
                ))}
            </div>

            <div className="mt-auto pt-4 space-y-2">
                <button
                    onClick={handleSaveToUiFile}
                    className="bg-purple-500 hover:bg-purple-700 text-white dark:text-gray-200 font-bold py-2 px-4 rounded w-full">
                    Export Design
                </button>

                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-indigo-500 hover:bg-indigo-700 text-white dark:text-gray-200 font-bold py-2 px-4 rounded w-full">
                    Load Design
                </button>

                <button
                    onClick={handleExport}
                    disabled={isUiFileLoaded}
                    className={`bg-green-600 hover:bg-green-700 text-white dark:text-gray-200 font-bold py-2 px-4 rounded w-full ${
                        isUiFileLoaded ? "opacity-50 cursor-not-allowed" : ""
                    }`}>
                    Export Project
                </button>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".ui"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>
        </aside>
    );
};

export default LeftPanel;
