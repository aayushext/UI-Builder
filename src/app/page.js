"use client";
import { useState, useEffect, useRef } from "react";
import LeftPanel from "../components/LeftPanel";
import CenterPanel from "../components/CenterPanel";
import RightPanel from "../components/RightPanel";
import ScreenTabs from "../components/ScreenTabs";
import {
    generatePythonLoaderCode,
    generateQtUiFile,
} from "../utils/generatePySideCode";
import { exportToUiFile, importFromUiFile } from "../utils/saveSystem";
import {
    createComponent,
    getComponentDefinitions,
} from "../utils/componentLoader";

import JSZip from "jszip";

export default function Home() {
    const [screens, setScreens] = useState([
        {
            id: 0,
            name: "Screen 1",
            customId: "screen_0",
            components: [],
            backgroundColor: "#ffffff",
            width: 1280,
            height: 800,
        },
    ]);
    const [nextScreenId, setNextScreenId] = useState(1);
    const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
    const [nextComponentId, setNextComponentId] = useState(0);
    const [selectedComponentId, setSelectedComponentId] = useState(null);

    const centerPanelRef = useRef(null);
    const [centerPanelDimensions, setCenterPanelDimensions] = useState({
        width: 1000,
        height: 1000,
    });

    const [zoomLevel, setZoomLevel] = useState(1); // 1 = 100%
    const [minZoom] = useState(0.1); // 10%
    const [maxZoom] = useState(3); // 300%

    const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });

    const addComponent = (type) => {
        try {
            const newComponent = createComponent(type, nextComponentId);
            const updatedScreens = [...screens];
            updatedScreens[currentScreenIndex].components.push(newComponent);
            setScreens(updatedScreens);
            setNextComponentId(nextComponentId + 1);
            setSelectedComponentId(newComponent.id);
        } catch (error) {
            console.error(`Error creating component: ${error.message}`);
        }
    };

    const addScreen = () => {
        const newScreen = {
            id: nextScreenId,
            name: `Screen ${nextScreenId + 1}`,
            customId: `screen_${nextScreenId}`,
            components: [],
            backgroundColor: "#ffffff",
            width: 1280,
            height: 800,
        };
        setScreens([...screens, newScreen]);
        setNextScreenId(nextScreenId + 1);
        setCurrentScreenIndex(screens.length);
    };

    const updateScreenCustomId = (screenIndex, newCustomId) => {
        if (!/^[a-zA-Z0-9_]+$/.test(newCustomId)) {
            alert(
                "Screen ID can only contain letters, numbers, and underscores"
            );
            return false;
        }

        if (newCustomId.length > 20) {
            alert("Screen ID cannot exceed 20 characters");
            return false;
        }

        const isDuplicate = screens.some(
            (screen, idx) =>
                idx !== screenIndex && screen.customId === newCustomId
        );

        if (isDuplicate) {
            alert("Screen ID must be unique");
            return false;
        }

        const updatedScreens = [...screens];
        updatedScreens[screenIndex].customId = newCustomId;
        setScreens(updatedScreens);
        return true;
    };

    const deleteScreen = (screenId) => {
        if (screens.length > 1) {
            const updatedScreens = screens.filter(
                (screen) => screen.id !== screenId
            );
            setScreens(updatedScreens);
            if (currentScreenIndex >= updatedScreens.length) {
                setCurrentScreenIndex(updatedScreens.length - 1);
            }
            setSelectedComponentId(null);
        }
    };
    const deleteComponent = (id) => {
        const updatedScreens = screens.map((screen) => ({
            ...screen,
            components: screen.components.filter(
                (component) => component.id !== id
            ),
        }));
        setScreens(updatedScreens);
        if (selectedComponentId === id) {
            setSelectedComponentId(null);
        }
    };

    const resizeComponent = (id, newSizeAndPosition, isTemporary = false) => {
        const updatedScreens = screens.map((screen) => ({
            ...screen,
            components: screen.components.map((component) =>
                component.id === id
                    ? { ...component, ...newSizeAndPosition }
                    : component
            ),
        }));

        setScreens(updatedScreens);
    };

    const moveComponent = (id, newPosition) => {
        const updatedScreens = screens.map((screen) => ({
            ...screen,
            components: screen.components.map((component) =>
                component.id === id
                    ? { ...component, x: newPosition.x, y: newPosition.y }
                    : component
            ),
        }));
        setScreens(updatedScreens);
    };

    const updateComponentProps = (id, newProps) => {
        const updatedScreens = screens.map((screen) => ({
            ...screen,
            components: screen.components.map((component) =>
                component.id === id ? { ...component, ...newProps } : component
            ),
        }));
        setScreens(updatedScreens);
    };
    const updateScreenBackgroundColor = (screenIndex, newColor) => {
        const updatedScreens = [...screens];
        updatedScreens[screenIndex].backgroundColor = newColor;
        setScreens(updatedScreens);
    };
    const updateScreenDimensions = (screenIndex, dimensions) => {
        const updatedScreens = [...screens];

        updatedScreens.forEach((screen) => {
            if (dimensions.width) {
                screen.width = dimensions.width;
            }
            if (dimensions.height) {
                screen.height = dimensions.height;
            }
        });

        setScreens(updatedScreens);
    };
    const selectComponent = (id) => {
        setSelectedComponentId(id);
    };

    const duplicateComponent = () => {
        if (!selectedComponentId) return;

        let componentToDuplicate = null;

        for (const screen of screens) {
            const found = screen.components.find(
                (comp) => comp.id === selectedComponentId
            );
            if (found) {
                componentToDuplicate = found;
                break;
            }
        }

        if (!componentToDuplicate) return;

        const newComponent = {
            ...JSON.parse(JSON.stringify(componentToDuplicate)),
            id: nextComponentId,
            x: componentToDuplicate.x + 20,
            y: componentToDuplicate.y + 20,
        };

        const updatedScreens = [...screens];
        updatedScreens[currentScreenIndex].components.push(newComponent);
        setScreens(updatedScreens);
        setNextComponentId(nextComponentId + 1);
        setSelectedComponentId(newComponent.id);
    };

    const handleZoomIn = () => {
        setZoomLevel((prev) => Math.min(maxZoom, prev + 0.1));
    };

    const handleZoomOut = () => {
        setZoomLevel((prev) => Math.max(minZoom, prev - 0.1));
    };

    const handleWheel = (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
            const zoomFactor = e.deltaY > 0 ? -0.05 : 0.05;
            setZoomLevel((prev) =>
                Math.max(minZoom, Math.min(maxZoom, prev + zoomFactor))
            );
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

    const handleResetView = () => {
        setPanPosition({ x: 0, y: 0 });
        setZoomLevel(1);
    };

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
                setSelectedComponentId(null);
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
    }, [selectedComponentId]);

    useEffect(() => {
        if (centerPanelRef.current) {
            setCenterPanelDimensions({
                width: centerPanelRef.current.offsetWidth,
                height: centerPanelRef.current.offsetHeight,
            });
        }
    }, [screens, currentScreenIndex]);

    const handleExport = async () => {
        // Generate UI file content
        const uiFile = generateQtUiFile(
            screens,
            currentScreenIndex,
            centerPanelDimensions
        );

        // Generate Python loader code
        const pythonFile = generatePythonLoaderCode();

        // Create zip file
        const zip = new JSZip();
        zip.file("ui-designer.ui", uiFile);
        zip.file("main.py", pythonFile);

        // Generate the zip file
        const zipContent = await zip.generateAsync({ type: "blob" });

        // Create download link
        const url = URL.createObjectURL(zipContent);
        const link = document.createElement("a");
        link.href = url;
        link.download = "ui-project.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleSaveToUiFile = () => {
        exportToUiFile(screens, currentScreenIndex);
    };

    const handleLoadFromUiFile = async (file) => {
        try {
            const appState = await importFromUiFile(file);

            if (!appState.screens || !Array.isArray(appState.screens)) {
                throw new Error("Invalid file format: missing screens array");
            }

            setScreens(appState.screens);
            setNextScreenId(appState.nextScreenId || appState.screens.length);
            setCurrentScreenIndex(
                Math.min(
                    appState.currentScreenIndex || 0,
                    appState.screens.length - 1
                )
            );
            setNextComponentId(appState.nextComponentId);

            // Clear selection
            setSelectedComponentId(null);
        } catch (error) {
            alert(`Error loading design: ${error.message}`);
            console.error("Import error:", error);
        }
    };

    const currentScreenComponents =
        screens[currentScreenIndex]?.components || [];
    const selectedComponent = currentScreenComponents.find(
        (c) => c.id === selectedComponentId
    );

    return (
        <div className="flex flex-col h-screen">
            <div className="flex flex-1 overflow-hidden">
                <LeftPanel
                    onAddComponent={addComponent}
                    onSaveToUiFile={handleSaveToUiFile}
                    onLoadFromUiFile={handleLoadFromUiFile}
                    onExport={handleExport}
                    className="flex-shrink-0"
                />
                <div className="flex flex-col flex-1 min-w-0">
                    {" "}
                    <ScreenTabs
                        screens={screens}
                        currentScreenIndex={currentScreenIndex}
                        onScreenChange={setCurrentScreenIndex}
                        onAddScreen={addScreen}
                        onDeleteScreen={deleteScreen}
                    />
                    <CenterPanel
                        ref={centerPanelRef}
                        components={currentScreenComponents}
                        onDeleteComponent={deleteComponent}
                        onDuplicateComponent={duplicateComponent}
                        onResizeComponent={resizeComponent}
                        onMoveComponent={moveComponent}
                        onSelectComponent={selectComponent}
                        selectedComponentId={selectedComponentId}
                        backgroundColor={
                            screens[currentScreenIndex]?.backgroundColor ||
                            "#ffffff"
                        }
                        screenWidth={screens[currentScreenIndex]?.width || 1280}
                        screenHeight={
                            screens[currentScreenIndex]?.height || 800
                        }
                        zoomLevel={zoomLevel}
                        onZoomIn={handleZoomIn}
                        onZoomOut={handleZoomOut}
                        onWheel={handleWheel}
                        panPosition={panPosition}
                        onPanStart={handlePanStart}
                        onPanMove={handlePanMove}
                        onPanEnd={handlePanEnd}
                        onResetView={handleResetView}
                    />
                </div>
                <RightPanel
                    selectedComponent={selectedComponent}
                    onUpdateComponentProps={updateComponentProps}
                    currentScreen={screens[currentScreenIndex]}
                    onUpdateScreenBackgroundColor={(color) =>
                        updateScreenBackgroundColor(currentScreenIndex, color)
                    }
                    onUpdateScreenDimensions={(dimensions) =>
                        updateScreenDimensions(currentScreenIndex, dimensions)
                    }
                    onUpdateScreenCustomId={(customId) =>
                        updateScreenCustomId(currentScreenIndex, customId)
                    }
                    onDuplicateComponent={duplicateComponent}
                    className="flex-shrink-0"
                />
            </div>
        </div>
    );
}
