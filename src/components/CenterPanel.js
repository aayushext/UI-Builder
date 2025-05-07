import React, { useMemo } from "react";
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
    zoomLevel,
    dropTargetFrameId,
    mainBackgroundColor
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
                    zoomLevel,
                    dropTargetFrameId,
                    mainBackgroundColor
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
            zoomLevel={zoomLevel}
            isDropTarget={component.id === dropTargetFrameId}>
            {component.type === "PySideButton" && (
                <PySideButton
                    text={component.text}
                    fontSize={component.fontSize}
                    textColor={component.textColor}
                    backgroundColor={component.backgroundColor}
                    radius={component.radius}
                    pressedColor={component.pressedColor}
                    hoverColor={component.hoverColor}
                    borderColor={component.borderColor}
                    borderWidth={component.borderWidth}
                    hoverBorderColor={component.hoverBorderColor}
                    pressedBorderColor={component.pressedBorderColor}
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
                    borderWidth={component.borderWidth}
                    textAlign={component.textAlign}
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
                    trackColor={component.trackColor}
                    trackWidth={component.trackWidth}
                />
            )}
            {component.type === "PySideFrame" && (
                <PySideFrame
                    key={component.id}
                    backgroundColor={component.backgroundColor}
                    frameShape={component.frameShape}
                    frameShadow={component.frameShadow}
                    lineWidth={component.lineWidth}
                    midLineWidth={component.midLineWidth}
                    borderColor={component.borderColor}
                    borderWidth={component.borderWidth}
                    useCustomBorder={component.useCustomBorder}
                    width={component.width}
                    height={component.height}
                    mainBackgroundColor={mainBackgroundColor}>
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
    const dropTargetFrameId = useAppStore((s) => s.dropTargetFrameId);

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

    React.useEffect(() => {
        const element = ref.current;
        if (element) {
            element.addEventListener("wheel", onWheel, { passive: false });

            return () => {
                element.removeEventListener("wheel", onWheel, {
                    passive: false,
                });
            };
        }
    }, [ref, onWheel]);

    return (
        <main
            ref={ref}
            className="flex-1 p-0 overflow-hidden relative bg-transparent dark:bg-linear-to-b dark:from-slate-950 dark:to-slate-900 rounded-b-xl"
            style={{
                minWidth: 0,
                cursor: useAppStore.getState().isPanning ? "grabbing" : "grab",
            }}
            onMouseDown={onPanStart}
            onMouseMove={onPanMove}
            onMouseUp={onPanEnd}
            onMouseLeave={onPanEnd}>
            <div className="w-full h-full overflow-hidden p-4 relative">
                <div
                    className="relative mx-auto origin-top-left rounded-md shadow-2xl"
                    style={{
                        width: `${screenWidth}px`,
                        height: `${screenHeight}px`,
                        backgroundColor,
                        boxShadow: "0 0 10px rgba(0,0,0,0.2)",
                        overflow: "hidden",
                        transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
                        transition: useAppStore.getState().isPanning
                            ? "none"
                            : "transform 0.1s ease-out",
                        willChange: "transform",
                    }}>
                    {dropTargetFrameId === -1 && (
                        <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-sky-600 bg-sky-500/30 animate-[blink-overlay_1.5s_linear_infinite] rounded-lg z-100" />
                    )}
                    {topLevelComponents.map((component) =>
                        renderComponent(
                            component,
                            allComponents,
                            selectedComponentId,
                            handlers,
                            zoomLevel,
                            dropTargetFrameId,
                            backgroundColor
                        )
                    )}
                </div>
            </div>
            <div className="fixed bottom-6 right-[calc(16rem+0.75rem+1.5rem)] flex gap-2 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md p-2 rounded-lg shadow-xl z-50 motion-scale-in-[1.5] motion-opacity-in-[0%] motion-delay-[0ms] motion-delay-[0ms]/scale motion-delay-[0ms]/opacity motion-ease-spring-bouncier">
                <button
                    onClick={onZoomOut}
                    className="bg-slate-200/70 dark:bg-slate-700/70 hover:bg-slate-300/90 dark:hover:bg-slate-600/90 text-slate-700 dark:text-slate-200 rounded-md w-9 h-9 flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-150 ease-in-out motion-scale-in-[1.5] motion-opacity-in-[0%] motion-delay-[100ms] motion-delay-[100ms]/scale motion-delay-[100ms]/opacity motion-ease-spring-bouncier"
                    title="Zoom out">
                    <IconContext.Provider value={{ size: "1em" }}>
                        <FaMinus />
                    </IconContext.Provider>
                </button>
                <button
                    onClick={onResetView}
                    className="bg-slate-200/70 dark:bg-slate-700/70 hover:bg-slate-300/90 dark:hover:bg-slate-600/90 text-slate-700 dark:text-slate-200 rounded-md px-3.5 py-1.5 h-9 flex items-center justify-center font-semibold shadow-md hover:shadow-lg transition-all duration-150 ease-in-out motion-scale-in-[1.5] motion-opacity-in-[0%] motion-delay-[200ms] motion-delay-[200ms]/scale motion-delay-[200ms]/opacity motion-ease-spring-bouncier"
                    title="Reset view">
                    {Math.round(zoomLevel * 100)}%
                </button>
                <button
                    onClick={onZoomIn}
                    className="bg-slate-200/70 dark:bg-slate-700/70 hover:bg-slate-300/90 dark:hover:bg-slate-600/90 text-slate-700 dark:text-slate-200 rounded-md w-9 h-9 flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-150 ease-in-out motion-scale-in-[1.5] motion-opacity-in-[0%] motion-delay-[100ms] motion-delay-[100ms]/scale motion-delay-[100ms]/opacity motion-ease-spring-bouncier"
                    title="Zoom in">
                    <IconContext.Provider value={{ size: "1em" }}>
                        <FaPlus />
                    </IconContext.Provider>
                </button>
            </div>
        </main>
    );
});

CenterPanel.displayName = "CenterPanel";

export default CenterPanel;

if (
    typeof window !== "undefined" &&
    !document.getElementById("widget-blink-overlay-style")
) {
    const style = document.createElement("style");
    style.id = "widget-blink-overlay-style";
    style.innerHTML = `
    @keyframes blink-overlay {
        0% { opacity: 1; }
        50% { opacity: 0.4; }
        100% { opacity: 1; }
    }
    `;
    document.head.appendChild(style);
}
