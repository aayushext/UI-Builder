"use client";
import { useRef, useEffect, useState } from "react";
import LeftPanel from "../components/LeftPanel";
import CenterPanel from "../components/CenterPanel";
import RightPanel from "../components/RightPanel";
import ScreenTabs from "../components/ScreenTabs";
import { useAppStore } from "../store/useAppStore";

export default function Home() {
    const centerPanelRef = useRef(null);
    const [centerPanelDimensions, setCenterPanelDimensions] = useState({
        width: 1000,
        height: 1000,
    });

    // Zustand store selectors
    const {
        screens,
        nextScreenId,
        currentScreenIndex,
        nextComponentId,
        selectedComponentId,
        zoomLevel,
        minZoom,
        maxZoom,
        panPosition,
        isPanning,
        lastMousePosition,
        addComponent,
        addScreen,
        updateScreenCustomId,
        deleteScreen,
        deleteComponent,
        resizeComponent,
        moveComponent,
        updateComponentProps,
        updateScreenBackgroundColor,
        updateScreenDimensions,
        selectComponent,
        duplicateComponent,
        setCurrentScreenIndex,
        setZoomLevel,
        setPanPosition,
        setIsPanning,
        setLastMousePosition,
        handleZoomIn,
        handleZoomOut,
        handleWheel,
        handlePanStart,
        handlePanMove,
        handlePanEnd,
        handleResetView,
        handleExport,
        handleSaveToUiFile,
        handleLoadFromUiFile,
    } = useAppStore();

    useEffect(() => {
        if (centerPanelRef.current) {
            setCenterPanelDimensions({
                width: centerPanelRef.current.offsetWidth,
                height: centerPanelRef.current.offsetHeight,
            });
        }
    }, [screens, currentScreenIndex]);

    // Deselect component on outside click
    useEffect(() => {
        const inputElements = ["INPUT", "SELECT", "TEXTAREA"];
        let isAdjustingInput = false;

        const handleMouseDown = (event) => {
            if (inputElements.includes(event.target.tagName)) {
                isAdjustingInput = true;
                return;
            }
            let target = event.target;
            let insideRightPanelOrComponent = false;
            while (target) {
                if (target.dataset && target.dataset.id) {
                    insideRightPanelOrComponent = true;
                    break;
                }
                if (target.id === "right-panel") {
                    insideRightPanelOrComponent = true;
                    break;
                }
                target = target.parentNode;
            }
            if (!insideRightPanelOrComponent) {
                selectComponent(null);
            }
        };

        const handleMouseUp = () => {
            isAdjustingInput = false;
        };

        if (typeof window !== "undefined") {
            document.addEventListener("mousedown", handleMouseDown);
            document.addEventListener("mouseup", handleMouseUp);
        }

        return () => {
            if (typeof window !== "undefined") {
                document.removeEventListener("mousedown", handleMouseDown);
                document.removeEventListener("mouseup", handleMouseUp);
            }
        };
    }, [selectedComponentId, selectComponent]);

    const currentScreenComponents =
        screens[currentScreenIndex]?.components || [];
    const selectedComponent = currentScreenComponents.find(
        (c) => c.id === selectedComponentId
    );

    return (
        <div className="flex flex-col h-screen">
            <div className="flex flex-1 overflow-hidden">
                <LeftPanel centerPanelDimensions={centerPanelDimensions} />
                <div className="flex flex-col flex-1 min-w-0">
                    <ScreenTabs />
                    <CenterPanel
                        ref={centerPanelRef}
                        centerPanelDimensions={centerPanelDimensions}
                    />
                </div>
                <RightPanel />
            </div>
        </div>
    );
}
