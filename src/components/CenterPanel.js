import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { IconContext } from "react-icons";
import Widget from "./Widget";
import PySideButton from "@/components/pyside-components/PySideButton";
import PySideLabel from "@/components/pyside-components/PySideLabel";
import PySideSlider from "@/components/pyside-components/PySideSlider";
import PySideFrame from "@/components/pyside-components/PySideFrame";
import { FaPlus, FaMinus } from "react-icons/fa6";
import { useAppStore } from "../store/useAppStore";

const renderComponent = (
    component,
    allComponents,
    selectedComponentId,
    handlers,
    zoomLevel
) => {
    const {
        onDeleteComponent,
        onDuplicateComponent,
        onResizeComponent,
        onMoveComponent,
        onSelectComponent,
    } = handlers;

    let renderedChildren = null;
    if (component.type === "PySideFrame") {
        renderedChildren = allComponents
            .filter((comp) => comp.parentId === component.id)
            .map((childComp) =>
                renderComponent(
                    childComp,
                    allComponents,
                    selectedComponentId,
                    handlers,
                    zoomLevel
                )
            );
    }

    return (
        <Widget
            key={component.id}
            id={component.id}
            componentType={component.type}
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
            {/* Render the specific PySide component */}
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
            {component.type === "PySideFrame" && (
                <PySideFrame
                    backgroundColor={component.backgroundColor}
                    frameShape={component.frameShape}
                    frameShadow={component.frameShadow}
                    lineWidth={component.lineWidth}
                    midLineWidth={component.midLineWidth}>
                    {renderedChildren}
                </PySideFrame>
            )}
        </Widget>
    );
};

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
    const allComponents = screen.components || [];
    const backgroundColor = screen.backgroundColor || "#ffffff";
    const screenWidth = screen.width || 1280;
    const screenHeight = screen.height || 800;

    const topLevelComponents = allComponents.filter(
        (comp) => comp.parentId === null
    );

    const handlers = useMemo(
        () => ({
            onDeleteComponent,
            onDuplicateComponent,
            onResizeComponent,
            onMoveComponent,
            onSelectComponent,
        }),
        [
            onDeleteComponent,
            onDuplicateComponent,
            onResizeComponent,
            onMoveComponent,
            onSelectComponent,
        ]
    );

    return (
        <main
            ref={ref}
            className="flex-1 p-4 overflow-hidden relative bg-gray-400 dark:bg-gray-900"
            style={{
                minWidth: 0,
                cursor: useAppStore.getState().isPanning ? "grabbing" : "grab",
            }}
            onWheel={onWheel}
            onMouseDown={onPanStart}
            onMouseMove={onPanMove}
            onMouseUp={onPanEnd}
            onMouseLeave={onPanEnd}>
            <div
                className="relative mx-auto origin-top-left"
                style={{
                    width: `${screenWidth}px`,
                    height: `${screenHeight}px`,
                    backgroundColor: backgroundColor,
                    boxShadow: "0 0 10px rgba(0,0,0,0.2)",
                    overflow: "hidden",
                    transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
                    transition: useAppStore.getState().isPanning
                        ? "none"
                        : "transform 0.1s ease-out",
                    willChange: "transform",
                }}>
                {/* Render only top-level components;*/}
                {topLevelComponents.map((component) =>
                    renderComponent(
                        component,
                        allComponents,
                        selectedComponentId,
                        handlers,
                        zoomLevel
                    )
                )}
            </div>
            {/* Zoom controls */}
            <div className="fixed bottom-4 right-72 flex gap-2 bg-white dark:bg-gray-800 p-2 rounded-md shadow-lg z-50">
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
