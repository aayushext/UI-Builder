import { useRef, useState } from "react";
import { getComponentDefinitions } from "../utils/componentLoader";
import { useAppStore } from "../store/useAppStore";

const LeftPanel = ({ centerPanelDimensions }) => {
    const fileInputRef = useRef(null);
    const [isUiFileLoaded, setIsUiFileLoaded] = useState(false);
    const componentDefinitions = getComponentDefinitions();

    const addComponent = useAppStore((s) => s.addComponent);
    const handleSaveToUiFile = useAppStore((s) => s.handleSaveToUiFile);
    const handleLoadFromUiFile = useAppStore((s) => s.handleLoadFromUiFile);
    const handleExport = useAppStore((s) => s.handleExport);

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
                    onClick={() => handleExport(centerPanelDimensions)}
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
