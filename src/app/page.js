"use client";
import { useState, useEffect, useRef } from "react";
import LeftPanel from "../components/LeftPanel";
import CenterPanel from "../components/CenterPanel";
import RightPanel from "../components/RightPanel";
import ScreenTabs from "../components/ScreenTabs";
import {
    generatePySideCode,
    generateQtUiFile,
} from "../utils/generatePySideCode";
import { exportToJson, importFromJson } from "../utils/saveSystem";
import {
    createComponent,
    getComponentDefinitions,
} from "../utils/componentLoader";

export default function Home() {
    const [screens, setScreens] = useState([
        {
            id: 0,
            name: "Screen 1",
            components: [],
            backgroundColor: "#ffffff",
            width: 1280,
            height: 800,
        },
    ]); // Array of screens
    const [nextScreenId, setNextScreenId] = useState(1);
    const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
    const [nextComponentId, setNextComponentId] = useState(0);
    const [selectedComponentId, setSelectedComponentId] = useState(null);

    const centerPanelRef = useRef(null);
    const [centerPanelDimensions, setCenterPanelDimensions] = useState({
        width: 1000,
        height: 1000,
    });

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
            components: [],
            backgroundColor: "#ffffff",
            width: 1280, // Default width
            height: 800, // Default height
        };
        setScreens([...screens, newScreen]);
        setNextScreenId(nextScreenId + 1);
        setCurrentScreenIndex(screens.length);
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
        // This creates a new array of screens with the updated component
        const updatedScreens = screens.map((screen) => ({
            ...screen,
            components: screen.components.map((component) =>
                component.id === id
                    ? { ...component, ...newSizeAndPosition }
                    : component
            ),
        }));

        // Update state with the new dimensions
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

        // Apply dimensions to all screens to keep them consistent
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

    // const handleExport = () => {
    //   const pyCode = generatePySideCode(
    //     screens,
    //     currentScreenIndex,
    //     centerPanelDimensions
    //   );
    //   const blob = new Blob([pyCode], { type: "text/plain;charset=utf-8" });
    //   const url = URL.createObjectURL(blob);
    //   const link = document.createElement("a");
    //   link.href = url;
    //   link.download = "ui.py";
    //   document.body.appendChild(link);
    //   link.click();
    //   document.body.removeChild(link);
    //   URL.revokeObjectURL(url);
    // };

    const handleExport = () => {
        const uiFile = generateQtUiFile(
            screens,
            currentScreenIndex,
            centerPanelDimensions
        );
        const blob = new Blob([uiFile], {
            type: "application/xml;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "ui-designer.ui";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleSaveToJson = () => {
        const appState = {
            screens,
            nextScreenId,
            currentScreenIndex,
            nextComponentId,
        };
        exportToJson(appState);
    };

    const handleLoadFromJson = async (file) => {
        try {
            const appState = await importFromJson(file);

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

            const highestId = Math.max(
                0,
                ...appState.screens
                    .flatMap((screen) =>
                        screen.components.map((comp) => comp.id)
                    )
                    .filter((id) => !isNaN(id))
            );
            setNextComponentId(appState.nextComponentId || highestId + 1);

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
                    onExport={handleExport}
                    onSaveToJson={handleSaveToJson}
                    onLoadFromJson={handleLoadFromJson}
                />
                <div className="flex flex-col flex-1">
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
                        onDuplicateComponent={duplicateComponent} // Add this line
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
                    onDuplicateComponent={duplicateComponent}
                />
            </div>
        </div>
    );
}
