import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { getComponentDefinitionByType } from "../utils/componentLoader";
import CustomColorPicker from "./CustomColorPicker";
import { useAppStore } from "../store/rootStore";

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
                    className="mt-1 py-1 px-2 block w-full rounded-md bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 sm:text-sm transition-colors duration-150"
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
                    className="mt-1 py-1 px-2 block w-full rounded-md bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 sm:text-sm transition-colors duration-150"
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
                    className="mt-1 py-1 px-2 block w-full rounded-md bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 sm:text-sm transition-colors duration-150 appearance-none bg-no-repeat bg-right pr-8"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: "right 0.5rem center",
                        backgroundSize: "1.5em 1.5em",
                    }}>
                    {property.options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            );

        case "boolean":
            return (
                <input
                    type="checkbox"
                    id={property.name}
                    checked={value}
                    onChange={(e) => onChange(e.target.checked)}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="mt-1 h-4 w-4 rounded-md border-slate-400 dark:border-slate-500 text-indigo-600 focus:ring-indigo-500/50 focus:ring-2 shadow-sm"
                />
            );

        default:
            return <div>Unknown property type: {property.type}</div>;
    }
};

PropertyEditor.propTypes = {
    property: PropTypes.shape({
        name: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        label: PropTypes.string,
        step: PropTypes.number,
        min: PropTypes.number,
        max: PropTypes.number,
        hasMaxRadius: PropTypes.bool,
        options: PropTypes.arrayOf(
            PropTypes.shape({
                value: PropTypes.string.isRequired,
                label: PropTypes.string.isRequired,
            })
        ),
    }).isRequired,
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
    component: PropTypes.object.isRequired,
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

    // Effect to ensure lineWidth is 0 for HLine/VLine frames with Plain shadow,
    // as these specific configurations should not have a visible line width
    // controlled by the lineWidth property directly in the property panel.
    useEffect(() => {
        if (
            selectedComponent &&
            selectedComponent.type === "PySideFrame" &&
            (selectedComponent.frameShape === "HLine" ||
                selectedComponent.frameShape === "VLine") &&
            selectedComponent.frameShadow === "Plain"
        ) {
            if (selectedComponent.lineWidth !== 0) {
                updateComponentProps(selectedComponent.id, { lineWidth: 0 });
            }
        }
    }, [
        selectedComponent?.id,
        selectedComponent?.type,
        selectedComponent?.frameShape,
        selectedComponent?.frameShadow,
        selectedComponent?.lineWidth,
        updateComponentProps,
    ]);

    // Effect to enforce specific lineWidth and midLineWidth for certain frameShapes
    // (e.g., NoFrame, WinPanel) or specific combinations (HLine/VLine with Plain shadow).
    // This ensures visual consistency and correct behavior based on Qt's rendering for these frame types.
    useEffect(() => {
        if (selectedComponent && selectedComponent.type === "PySideFrame") {
            const { id, frameShape, lineWidth, midLineWidth } =
                selectedComponent;
            let propsToUpdate = {};
            let needsUpdate = false;

            if (frameShape === "NoFrame") {
                if (lineWidth !== 0) {
                    propsToUpdate.lineWidth = 0;
                    needsUpdate = true;
                }
                if (midLineWidth !== 0) {
                    propsToUpdate.midLineWidth = 0;
                    needsUpdate = true;
                }
            } else if (frameShape === "WinPanel") {
                if (lineWidth !== 1) {
                    propsToUpdate.lineWidth = 1;
                    needsUpdate = true;
                }
                if (midLineWidth !== 1) {
                    propsToUpdate.midLineWidth = 1;
                    needsUpdate = true;
                }
            } else if (
                (frameShape === "HLine" || frameShape === "VLine") &&
                selectedComponent.frameShadow === "Plain"
            ) {
                if (lineWidth !== 0) {
                    propsToUpdate.lineWidth = 0;
                    needsUpdate = true;
                }
            }

            if (needsUpdate && Object.keys(propsToUpdate).length > 0) {
                updateComponentProps(id, propsToUpdate);
            }
        }
    }, [selectedComponent, updateComponentProps]);

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
            className="w-64 bg-slate-200 dark:bg-slate-800 p-4 overflow-auto shrink-0 overflow-x-clip motion-translate-x-in-[25%] motion-translate-y-in-[0%] motion-duration-[500ms] motion-ease-spring-bouncy fixed top-3 right-3 h-[calc(100vh-1.5rem)] shadow-2xl rounded-xl z-[30]">
            <h2 className="text-lg font-semibold mb-2 text-slate-700 dark:text-slate-200">
                Screen Properties
            </h2>

            {/* Screen Width */}
            <div className="mb-4 motion-scale-in-[1.5] motion-opacity-in-[0%] motion-delay-[0ms] motion-delay-[0ms]/scale motion-delay-[0ms]/opacity motion-ease-spring-bouncier">
                <label
                    htmlFor="screenWidth"
                    className="block text-sm font-medium text-slate-600 dark:text-slate-300">
                    Width (px)
                </label>
                <input
                    type="number"
                    id="screenWidth"
                    value={screenWidth}
                    min="320"
                    step="10"
                    onChange={(e) => handleScreenWidthChange(e.target.value)}
                    className="mt-1 py-1 px-2 block w-full rounded-md bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 sm:text-sm transition-colors duration-150"
                />
            </div>

            {/* Screen Height */}
            <div className="mb-4 motion-scale-in-[1.5] motion-opacity-in-[0%] motion-delay-[100ms] motion-delay-[100ms]/scale motion-delay-[100ms]/opacity motion-ease-spring-bouncier">
                <label
                    htmlFor="screenHeight"
                    className="block text-sm font-medium text-slate-600 dark:text-slate-300">
                    Height (px)
                </label>
                <input
                    type="number"
                    id="screenHeight"
                    value={screenHeight}
                    min="240"
                    step="10"
                    onChange={(e) => handleScreenHeightChange(e.target.value)}
                    className="mt-1 py-1 px-2 block w-full rounded-md bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 sm:text-sm transition-colors duration-150"
                />
            </div>

            {/* Screen ID */}
            <div className="mb-4 motion-scale-in-[1.5] motion-opacity-in-[0%] motion-delay-[200ms] motion-delay-[200ms]/scale motion-delay-[200ms]/opacity motion-ease-spring-bouncier">
                <label
                    htmlFor="screenCustomId"
                    className="block text-sm font-medium text-slate-600 dark:text-slate-300">
                    Screen ID
                </label>
                <input
                    type="text"
                    id="screenCustomId"
                    value={screenCustomId}
                    onChange={(e) => handleScreenCustomIdChange(e.target.value)}
                    className="mt-1 py-1 px-2 block w-full rounded-md bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 sm:text-sm transition-colors duration-150"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Used as the widget name in the UI file
                </p>
            </div>

            {/* Background Color */}
            <div className="mb-4 motion-scale-in-[1.5] motion-opacity-in-[0%] motion-delay-[300ms] motion-delay-[300ms]/scale motion-delay-[300ms]/opacity motion-ease-spring-bouncier">
                <label
                    htmlFor="screenBackgroundColor"
                    className="block text-sm font-medium text-slate-600 dark:text-slate-300">
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
                    <h2 className="text-lg font-semibold mb-2 mt-4 motion-scale-in-[0.5] motion-opacity-in-[0%] motion-duration-[500ms] motion-ease-spring-bouncier text-slate-700 dark:text-slate-200  sticky">
                        Component Properties
                    </h2>

                    <button
                        onClick={duplicateComponent}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-md mb-4 w-full shadow-md hover:shadow-lg transition-all duration-150 ease-in-out motion-scale-in-[0.5] motion-opacity-in-[0%] motion-duration-[500ms] motion-ease-spring-bouncier  sticky">
                        Duplicate Widget
                    </button>

                    {/* Position and size properties */}
                    <div className="mb-4 motion-scale-in-[0.5] motion-opacity-in-[0%] motion-duration-[500ms] motion-ease-spring-bouncier  sticky">
                        <label
                            htmlFor="x"
                            className="block text-sm font-medium text-slate-600 dark:text-slate-300">
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
                            className="mt-1 py-1 px-2 block w-full rounded-md bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 sm:text-sm transition-colors duration-150"
                        />
                    </div>

                    <div className="mb-4 motion-scale-in-[0.5] motion-opacity-in-[0%] motion-duration-[500ms] motion-ease-spring-bouncier  sticky">
                        <label
                            htmlFor="y"
                            className="block text-sm font-medium text-slate-600 dark:text-slate-300">
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
                            className="mt-1 py-1 px-2 block w-full rounded-md bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 sm:text-sm transition-colors duration-150"
                        />
                    </div>

                    <div className="mb-4 motion-scale-in-[0.5] motion-opacity-in-[0%] motion-duration-[500ms] motion-ease-spring-bouncier  sticky">
                        <label
                            htmlFor="width"
                            className="block text-sm font-medium text-slate-600 dark:text-slate-300">
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
                            className="mt-1 py-1 px-2 block w-full rounded-md bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 sm:text-sm transition-colors duration-150"
                        />
                    </div>

                    <div className="mb-4 motion-scale-in-[0.5] motion-opacity-in-[0%] motion-duration-[500ms] motion-ease-spring-bouncier  sticky">
                        <label
                            htmlFor="height"
                            className="block text-sm font-medium text-slate-600 dark:text-slate-300">
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
                            className="mt-1 py-1 px-2 block w-full rounded-md bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 sm:text-sm transition-colors duration-150"
                        />
                    </div>

                    {componentDefinition.properties.map((property) => {
                        // Conditional rendering for Frame border properties
                        if (
                            selectedComponent.type === "PySideFrame" &&
                            (property.name === "borderColor" ||
                                property.name === "borderWidth" ||
                                property.name === "radius") &&
                            !selectedComponent.useCustomBorder
                        ) {
                            return null;
                        }

                        // Hide lineWidth and midLineWidth for NoFrame and WinPanel
                        if (
                            selectedComponent.type === "PySideFrame" &&
                            (property.name === "lineWidth" ||
                                property.name === "midLineWidth") &&
                            (selectedComponent.frameShape === "NoFrame" ||
                                selectedComponent.frameShape === "WinPanel")
                        ) {
                            return null;
                        }

                        // Hide lineWidth for HLine/VLine + Plain
                        if (
                            selectedComponent.type === "PySideFrame" &&
                            property.name === "lineWidth" &&
                            (selectedComponent.frameShape === "HLine" ||
                                selectedComponent.frameShape === "VLine") &&
                            selectedComponent.frameShadow === "Plain"
                        ) {
                            return null;
                        }

                        return (
                            <div
                                className={`mb-4 motion-scale-in-[0.5] motion-opacity-in-[0%] motion-duration-[500ms] motion-ease-spring-bouncier  sticky`}
                                key={property.name}>
                                <label
                                    htmlFor={property.name}
                                    className={`block text-sm font-medium text-slate-600 dark:text-slate-300 ${
                                        property.type === "boolean"
                                            ? "inline-block mr-2 align-middle"
                                            : ""
                                    }`}>
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
                                        handlePropertyChange(
                                            property.name,
                                            value
                                        )
                                    }
                                    component={selectedComponent}
                                />
                            </div>
                        );
                    })}
                </>
            )}
        </aside>
    );
};

RightPanel.propTypes = {};

export default RightPanel;
