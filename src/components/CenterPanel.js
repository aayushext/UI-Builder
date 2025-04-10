import React, { useEffect, useRef } from "react";
import { IconContext } from "react-icons";

import Widget from "./Widget";
import PySideButton from "@/components/pyside-components/PySideButton";
import PySideLabel from "@/components/pyside-components/PySideLabel";
import PySideSlider from "@/components/pyside-components/PySideSlider";
import { FaPlus, FaMinus } from "react-icons/fa6";
import { useAppStore } from "../store/StateStore";
import { useScreenStore } from "@/store/ScreenStore";
import { useComponentStore } from "@/store/ComponentStore";

const CenterPanel = () => {
    const ref = useRef(null);

    // Get state and actions directly from the store
    const {
        getCurrentScreen,
        zoomLevel,
        panPosition,
        isPanning,
        lastMousePosition,
        handleZoomIn,
        handleZoomOut,
        handleWheelZoom,
        setPanPosition,
        setIsPanning,
        setLastMousePosition,
        resetView,
    } = useScreenStore();

    const {
        getCurrentScreenComponents,
        selectedComponentId,
        deleteComponent,
        duplicateComponent,
        resizeComponent,
        moveComponent,
        selectComponent,
    } = useComponentStore();

    // Get current screen and its components using the store's selectors
    const currentScreen = getCurrentScreen();
    const currentScreenComponents = getCurrentScreenComponents();

    const backgroundColor = currentScreen?.backgroundColor || "#ffffff";
    const screenWidth = currentScreen?.width || 1280;
    const screenHeight = currentScreen?.height || 800;

    useEffect(() => {
        const preventBrowserZoom = (e) => {
            if (e.ctrlKey) e.preventDefault();
        };

        document.addEventListener("wheel", preventBrowserZoom, {
            passive: false,
        });

        return () => {
            document.removeEventListener("wheel", preventBrowserZoom);
        };
    }, []);

    const handleWheel = (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
            handleWheelZoom(e.deltaY);
        }
    };

    const handlePanStart = (e) => {
        // Only start panning with middle mouse button (button 1) or if space is held down
        if (e.button === 1 || e.altKey) {
            setIsPanning(true);
            setLastMousePosition({ x: e.clientX, y: e.clientY });
            e.preventDefault();
        }
    };

    const handlePanMove = (e) => {
        if (isPanning) {
            const deltaX = e.clientX - lastMousePosition.x;
            const deltaY = e.clientY - lastMousePosition.y;

            setPanPosition({
                x: panPosition.x + deltaX,
                y: panPosition.y + deltaY,
            });

            setLastMousePosition({ x: e.clientX, y: e.clientY });
            e.preventDefault();
        }
    };

    const handlePanEnd = () => {
        setIsPanning(false);
    };

    return (
        <main
            ref={ref}
            className="flex-1 p-4 overflow-auto relative"
            style={{
                minWidth: 0,
            }}
            onWheel={handleWheel}
            onMouseDown={handlePanStart}
            onMouseMove={handlePanMove}
            onMouseUp={handlePanEnd}
            onMouseLeave={handlePanEnd}>
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
                {currentScreenComponents.map((component) => (
                    <Widget key={component.id} id={component.id}>
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
                    onClick={handleZoomOut}
                    className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md w-8 h-8 flex items-center justify-center"
                    title="Zoom out">
                    <IconContext.Provider value={{ size: "1em" }}>
                        <div>
                            <FaMinus />
                        </div>
                    </IconContext.Provider>
                </button>
                <button
                    onClick={resetView}
                    className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md px-2 flex items-center justify-center"
                    title="Reset view">
                    {Math.round(zoomLevel * 100)}%
                </button>
                <button
                    onClick={handleZoomIn}
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
};

export default CenterPanel;
