import { useState, useEffect } from "react";
import { getComponentDefinitionByType } from "../utils/componentLoader";
import CustomColorPicker from "./CustomColorPicker";
import { useAppStore } from "../store/useAppStore";

const PropertyEditor = ({ property, value, onChange, component }) => {
    const maxRadius = property.hasMaxRadius
        ? Math.min(component.width, component.height) / 2
        : null;

    switch (property.type) {
        case "text":
            return (
                <input
                    type="text"
                    id={property.name}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="mt-1 py-1 px-2 block w-full rounded-sm bg-gray-200 dark:bg-gray-700 selection:border-gray-300 dark:selection:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
            );

        case "number":
            return (
                <input
                    type="number"
                    id={property.name}
                    value={value}
                    step={property.step || 0.1}
                    min={property.min !== undefined ? property.min : undefined}
                    max={maxRadius || property.max}
                    onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="mt-1 py-1 px-2 block w-full rounded-sm bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
            );

        case "color":
            return <CustomColorPicker value={value} onChange={onChange} />;

        case "select":
            return (
                <select
                    id={property.name}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="mt-1 py-1 px-2 block w-full rounded-sm bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                    {property.options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            );

        default:
            return <div>Unknown property type: {property.type}</div>;
    }
};

const RightPanel = () => {
    const screens = useAppStore((s) => s.screens);
    const currentScreenIndex = useAppStore((s) => s.currentScreenIndex);
    const selectedComponentId = useAppStore((s) => s.selectedComponentId);
    const updateComponentProps = useAppStore((s) => s.updateComponentProps);
    const updateScreenBackgroundColor = useAppStore(
        (s) => s.updateScreenBackgroundColor
    );
    const updateScreenDimensions = useAppStore((s) => s.updateScreenDimensions);
    const duplicateComponent = useAppStore((s) => s.duplicateComponent);
    const updateScreenCustomId = useAppStore((s) => s.updateScreenCustomId);

    const currentScreen = screens[currentScreenIndex];
    const selectedComponent = currentScreen?.components.find(
        (c) => c.id === selectedComponentId
    );

    const [screenBackgroundColor, setScreenBackgroundColor] = useState(
        currentScreen?.backgroundColor || "#ffffff"
    );
    const [screenWidth, setScreenWidth] = useState(
        currentScreen?.width || 1280
    );
    const [screenHeight, setScreenHeight] = useState(
        currentScreen?.height || 800
    );
    const [screenCustomId, setScreenCustomId] = useState(
        currentScreen?.customId || "screen_0"
    );

    useEffect(() => {
        setScreenBackgroundColor(currentScreen?.backgroundColor || "#ffffff");
        setScreenWidth(currentScreen?.width || 1280);
        setScreenHeight(currentScreen?.height || 800);
        setScreenCustomId(currentScreen?.customId || "screen_0");
    }, [currentScreen]);

    const handleScreenWidthChange = (value) => {
        const width = parseInt(value) || 1280;
        setScreenWidth(width);
        updateScreenDimensions(currentScreenIndex, { width });
    };

    const handleScreenHeightChange = (value) => {
        const height = parseInt(value) || 800;
        setScreenHeight(height);
        updateScreenDimensions(currentScreenIndex, { height });
    };

    const handleScreenCustomIdChange = (value) => {
        setScreenCustomId(value);
        updateScreenCustomId(currentScreenIndex, value);
    };

    const componentDefinition = selectedComponent
        ? getComponentDefinitionByType(selectedComponent.type)
        : null;

    const handlePropertyChange = (name, value) => {
        if (selectedComponent) {
            updateComponentProps(selectedComponent.id, { [name]: value });
        }
    };

    return (
        <aside
            id="right-panel"
            className="w-64 bg-gray-200 dark:bg-gray-800 p-4 overflow-auto flex-shrink-0">
            <h2 className="text-lg font-bold mb-2">Screen Properties</h2>

            {/* Screen Width */}
            <div className="mb-4">
                <label
                    htmlFor="screenWidth"
                    className="block text-sm font-medium">
                    Width (px)
                </label>
                <input
                    type="number"
                    id="screenWidth"
                    value={screenWidth}
                    min="320"
                    step="10"
                    onChange={(e) => handleScreenWidthChange(e.target.value)}
                    className="mt-1 py-1 px-2 block w-full rounded-sm bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
            </div>

            {/* Screen Height */}
            <div className="mb-4">
                <label
                    htmlFor="screenHeight"
                    className="block text-sm font-medium">
                    Height (px)
                </label>
                <input
                    type="number"
                    id="screenHeight"
                    value={screenHeight}
                    min="240"
                    step="10"
                    onChange={(e) => handleScreenHeightChange(e.target.value)}
                    className="mt-1 py-1 px-2 block w-full rounded-sm bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
            </div>

            {/* Screen ID */}
            <div className="mb-4">
                <label
                    htmlFor="screenCustomId"
                    className="block text-sm font-medium">
                    Screen ID
                </label>
                <input
                    type="text"
                    id="screenCustomId"
                    value={screenCustomId}
                    onChange={(e) => handleScreenCustomIdChange(e.target.value)}
                    className="mt-1 py-1 px-2 block w-full rounded-sm bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                    Used as the widget name in the UI file
                </p>
            </div>

            {/* Background Color */}
            <div className="mb-4">
                <label
                    htmlFor="screenBackgroundColor"
                    className="block text-sm font-medium">
                    Background Color
                </label>
                <CustomColorPicker
                    value={screenBackgroundColor}
                    onChange={(color) => {
                        setScreenBackgroundColor(color);
                        updateScreenBackgroundColor(currentScreenIndex, color);
                    }}
                />
            </div>

            {selectedComponent && componentDefinition && (
                <>
                    <h2 className="text-lg font-bold mb-2 mt-4">
                        Component Properties
                    </h2>

                    <button
                        onClick={duplicateComponent}
                        className="bg-teal-500 dark:bg-teal-600 dark:hover:bg-teal-800 hover:bg-teal-700 font-bold py-2 px-4 rounded-sm mb-4 w-full">
                        Duplicate Widget
                    </button>

                    {/* Position and size properties are always available */}
                    <div className="mb-4">
                        <label
                            htmlFor="x"
                            className="block text-sm font-medium ">
                            X Position
                        </label>
                        <input
                            type="number"
                            id="x"
                            value={selectedComponent.x}
                            step="0.1"
                            onChange={(e) =>
                                handlePropertyChange(
                                    "x",
                                    parseFloat(e.target.value) || 0
                                )
                            }
                            onMouseDown={(e) => e.stopPropagation()}
                            className="mt-1 py-1 px-2 block w-full rounded-sm bg-gray-200 dark:bg-gray-700 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div className="mb-4">
                        <label
                            htmlFor="y"
                            className="block text-sm font-medium ">
                            Y Position
                        </label>
                        <input
                            type="number"
                            id="y"
                            value={selectedComponent.y}
                            step="0.1"
                            onChange={(e) =>
                                handlePropertyChange(
                                    "y",
                                    parseFloat(e.target.value) || 0
                                )
                            }
                            onMouseDown={(e) => e.stopPropagation()}
                            className="mt-1 py-1 px-2 block w-full rounded-sm bg-gray-200 dark:bg-gray-700 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div className="mb-4">
                        <label
                            htmlFor="width"
                            className="block text-sm font-medium ">
                            Width
                        </label>
                        <input
                            type="number"
                            id="width"
                            value={selectedComponent.width}
                            step="0.1"
                            onChange={(e) =>
                                handlePropertyChange(
                                    "width",
                                    parseFloat(e.target.value) || 0
                                )
                            }
                            onMouseDown={(e) => e.stopPropagation()}
                            className="mt-1 py-1 px-2 block w-full rounded-sm bg-gray-200 dark:bg-gray-700 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div className="mb-4">
                        <label
                            htmlFor="height"
                            className="block text-sm font-medium ">
                            Height
                        </label>
                        <input
                            type="number"
                            id="height"
                            value={selectedComponent.height}
                            step="0.1"
                            onChange={(e) =>
                                handlePropertyChange(
                                    "height",
                                    parseFloat(e.target.value) || 0
                                )
                            }
                            onMouseDown={(e) => e.stopPropagation()}
                            className="mt-1 py-1 px-2 block w-full rounded-sm bg-gray-200 dark:bg-gray-700 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>

                    {/* Dynamically render property editors based on component definition */}
                    {componentDefinition.properties.map((property) => (
                        <div className="mb-4" key={property.name}>
                            <label
                                htmlFor={property.name}
                                className="block text-sm font-medium ">
                                {property.label}
                                {property.hasMaxRadius &&
                                    ` (Max: ${
                                        Math.min(
                                            selectedComponent.width,
                                            selectedComponent.height
                                        ) / 2
                                    })`}
                            </label>
                            <PropertyEditor
                                property={property}
                                value={selectedComponent[property.name]}
                                onChange={(value) =>
                                    handlePropertyChange(property.name, value)
                                }
                                component={selectedComponent}
                            />
                        </div>
                    ))}
                </>
            )}
        </aside>
    );
};

export default RightPanel;
