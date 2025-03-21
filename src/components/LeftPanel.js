import { useRef } from "react";
import { getComponentDefinitions } from "../utils/componentLoader";

const LeftPanel = ({
    onAddComponent,
    onExport,
    onSaveToJson,
    onLoadFromJson,
}) => {
    const fileInputRef = useRef(null);
    const componentDefinitions = getComponentDefinitions();

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            onLoadFromJson(file);
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
                        onClick={() => onAddComponent(component.type)}
                        className="bg-blue-500 hover:bg-blue-700 text-white dark:text-gray-200 font-bold py-2 px-4 rounded mt-4 w-full">
                        Add {component.displayName}
                    </button>
                ))}
            </div>

            <div className="mt-auto pt-4 space-y-2">
                <button
                    onClick={onSaveToJson}
                    className="bg-purple-500 hover:bg-purple-700 text-white dark:text-gray-200 font-bold py-2 px-4 rounded w-full">
                    Save Design
                </button>

                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-indigo-500 hover:bg-indigo-700 text-white dark:text-gray-200 font-bold py-2 px-4 rounded w-full">
                    Load Design
                </button>

                <button
                    onClick={onExport}
                    className="bg-green-600 hover:bg-green-700 text-white dark:text-gray-200 font-bold py-2 px-4 rounded w-full">
                    Export to .py
                </button>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>
        </aside>
    );
};

export default LeftPanel;
