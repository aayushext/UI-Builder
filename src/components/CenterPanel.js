import React from "react";
import { IconContext } from "react-icons";
import Widget from "./Widget";
import PySideButton from "@/components/pyside-components/PySideButton";
import PySideLabel from "@/components/pyside-components/PySideLabel";
import PySideSlider from "@/components/pyside-components/PySideSlider";
import { FaPlus, FaMinus } from "react-icons/fa6";
import { useAppStore } from "../store/useAppStore";

const CenterPanel = React.forwardRef(({ centerPanelDimensions }, ref) => {
    const screens = useAppStore((s) => s.screens);
    const currentScreenIndex = useAppStore((s) => s.currentScreenIndex);
    const selectedComponentId = useAppStore((s) => s.selectedComponentId);
    const zoomLevel = useAppStore((s) => s.zoomLevel);
    const panPosition = useAppStore((s) => s.panPosition);

    const onDeleteComponent = useAppStore((s) => s.deleteComponent);
    const onDuplicateComponent = useAppStore((s) => s.duplicateComponent);
    const onResizeComponent = useAppStore((s) => s.resizeComponent);
    const onMoveComponent = useAppStore((s) => s.moveComponent);
    const onSelectComponent = useAppStore((s) => s.selectComponent);

    const onZoomIn = useAppStore((s) => s.handleZoomIn);
    const onZoomOut = useAppStore((s) => s.handleZoomOut);
    const onWheel = useAppStore((s) => s.handleWheel);
    const onPanStart = useAppStore((s) => s.handlePanStart);
    const onPanMove = useAppStore((s) => s.handlePanMove);
    const onPanEnd = useAppStore((s) => s.handlePanEnd);
    const onResetView = useAppStore((s) => s.handleResetView);

    const screen = screens[currentScreenIndex] || {};
    const components = screen.components || [];
    const backgroundColor = screen.backgroundColor || "#ffffff";
    const screenWidth = screen.width || 1280;
    const screenHeight = screen.height || 800;

    return (
        <main
            ref={ref}
            className="flex-1 p-4 overflow-auto relative"
            style={{
                minWidth: 0,
            }}
            onWheel={onWheel}
            onMouseDown={onPanStart}
            onMouseMove={onPanMove}
            onMouseUp={onPanEnd}
            onMouseLeave={onPanEnd}>
            <div
                className="relative mx-auto"
                style={{
                    width: `${screenWidth}px`,
                    height: `${screenHeight}px`,
                    backgroundColor: backgroundColor,
                    boxShadow: "0 0 10px rgba(0,0,0,0.2)",
                    overflow: "hidden",
                    transform: `scale(${zoomLevel}) translate(${panPosition.x}px, ${panPosition.y}px)`,
                    transformOrigin: "center center",
                    transition: "transform 0.1s ease-out",
                }}>
                {components.map((component) => (
                    <Widget
                        key={component.id}
                        id={component.id}
                        x={component.x}
                        y={component.y}
                        width={component.width}
                        height={component.height}
                        onDelete={onDeleteComponent}
                        onDuplicate={onDuplicateComponent}
                        onResize={onResizeComponent}
                        onMove={onMoveComponent}
                        onSelect={onSelectComponent}
                        isSelected={component.id === selectedComponentId}
                        zoomLevel={zoomLevel}>
                        {component.type === "PySideButton" && (
                            <PySideButton
                                text={component.text}
                                fontSize={component.fontSize}
                                textColor={component.textColor}
                                backgroundColor={component.backgroundColor}
                                radius={component.radius}
                                pressedColor={component.pressedColor}
                                hoverColor={component.hoverColor}
                            />
                        )}
                        {component.type === "PySideLabel" && (
                            <PySideLabel
                                text={component.text}
                                fontSize={component.fontSize}
                                textColor={component.textColor}
                                backgroundColor={component.backgroundColor}
                                borderColor={component.borderColor}
                                radius={component.radius}
                            />
                        )}
                        {component.type === "PySideSlider" && (
                            <PySideSlider
                                width={component.width}
                                height={component.height}
                                minimum={component.minimum}
                                maximum={component.maximum}
                                value={component.value}
                                orientation={component.orientation}
                                sliderColor={component.sliderColor}
                                backgroundColor={component.backgroundColor}
                            />
                        )}
                    </Widget>
                ))}
            </div>
            {/* Zoom controls */}
            <div className="fixed bottom-4 right-72 flex gap-2 bg-white dark:bg-gray-800 p-2 rounded-md shadow-lg">
                <button
                    onClick={onZoomOut}
                    className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md w-8 h-8 flex items-center justify-center"
                    title="Zoom out">
                    <IconContext.Provider value={{ size: "1em" }}>
                        <div>
                            <FaMinus />
                        </div>
                    </IconContext.Provider>
                </button>
                <button
                    onClick={onResetView}
                    className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md px-2 flex items-center justify-center"
                    title="Reset view">
                    {Math.round(zoomLevel * 100)}%
                </button>
                <button
                    onClick={onZoomIn}
                    className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md w-8 h-8 flex items-center justify-center"
                    title="Zoom in">
                    <IconContext.Provider value={{ size: "1em" }}>
                        <div>
                            <FaPlus />
                        </div>
                    </IconContext.Provider>
                </button>
            </div>
        </main>
    );
});

CenterPanel.displayName = "CenterPanel";

export default CenterPanel;
