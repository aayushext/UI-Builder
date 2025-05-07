import { useRef, useState } from "react";
import PropTypes from "prop-types";
import { getComponentDefinitions } from "../utils/componentLoader";
import { useAppStore } from "../store/useAppStore";

const LeftPanel = ({ centerPanelDimensions }) => {
    const fileInputRef = useRef(null);
    const [isUiFileLoaded, setIsUiFileLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const componentDefinitions = getComponentDefinitions();

    const addComponent = useAppStore((s) => s.addComponent);
    const handleSaveToUiFile = useAppStore((s) => s.handleSaveToUiFile);
    const handleLoadFromUiFile = useAppStore((s) => s.handleLoadFromUiFile);
    const handleExport = useAppStore((s) => s.handleExport);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            setIsLoading(true);
            try {
                await handleLoadFromUiFile(file);
                setIsUiFileLoaded(true);
            } catch (error) {
                setIsUiFileLoaded(false);
            } finally {
                setIsLoading(false);
            }
        }
        event.target.value = "";
    };

    return (
        <aside className="w-64 bg-slate-200 dark:bg-slate-800 p-4 flex flex-col h-full shrink-0 motion-translate-x-in-[-25%] motion-translate-y-in-[0%] motion-duration-[500ms] motion-ease-spring-bouncy">
            {/* Components Section */}
            <div className="flex-1">
                <h2 className="text-lg font-bold mb-2">Components</h2>
                {componentDefinitions.map((component, idx) => {
                    const delay = idx * 100;
                    return (
                        <button
                            key={component.type}
                            onClick={() => addComponent(component.type)}
                            className={
                                `bg-blue-500 hover:bg-blue-700 text-white dark:text-slate-200 font-bold py-2 px-4 rounded mt-4 w-full ` +
                                `motion-scale-in-[1.5] motion-opacity-in-[0%] ` +
                                `motion-delay-[${delay}ms] ` +
                                `motion-delay-[${delay}ms]/scale ` +
                                `motion-delay-[${delay}ms]/opacity ` +
                                `motion-ease-spring-bouncier`
                            }>
                            Add {component.displayName}
                        </button>
                    );
                })}
            </div>

            {/* Buttons Section */}
            <div className="mt-auto pt-4 space-y-2">
                <button
                    onClick={handleSaveToUiFile}
                    className="bg-purple-500 hover:bg-purple-700 text-white dark:text-slate-200 font-bold py-2 px-4 rounded w-full motion-scale-in-[1.5] motion-opacity-in-[0%] motion-delay-[0ms] motion-delay-[0ms]/scale motion-delay-[0ms]/opacity motion-ease-spring-bouncier">
                    Export Design
                </button>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-indigo-500 hover:bg-indigo-700 text-white dark:text-slate-200 font-bold py-2 px-4 rounded w-full motion-scale-in-[1.5] motion-opacity-in-[0%] motion-delay-[100ms] motion-delay-[100ms]/scale motion-delay-[100ms]/opacity motion-ease-spring-bouncier">
                    Load Design
                </button>
                <button
                    onClick={() => handleExport(centerPanelDimensions)}
                    disabled={isUiFileLoaded}
                    className={`bg-green-600 hover:bg-green-700 text-white dark:text-slate-200 font-bold py-2 px-4 rounded w-full motion-scale-in-[1.5] motion-opacity-in-[0%] motion-delay-[200ms] motion-delay-[200ms]/scale motion-delay-[200ms]/opacity motion-ease-spring-bouncier ${
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
                    disabled={isLoading}
                />
            </div>

            {/* Loading Modal */}
            {isLoading && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded shadow-lg">
                        <p className="text-lg">Loading Design...</p>
                    </div>
                </div>
            )}
        </aside>
    );
};

LeftPanel.propTypes = {
    centerPanelDimensions: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }),
};

export default LeftPanel;
