"use client";
import { useState, useEffect, useRef } from "react";
import LeftPanel from "../components/LeftPanel";
import CenterPanel from "../components/CenterPanel";
import RightPanel from "../components/RightPanel";
import ScreenTabs from "../components/ScreenTabs";
import { generatePySideCode } from "../utils/generatePySideCode";
import { exportToJson, importFromJson } from "../utils/saveSystem";

export default function Home() {
  const [screens, setScreens] = useState([
    { id: 0, name: "Screen 1", components: [], backgroundColor: "#ffffff" },
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

  const addPySideButton = () => {
    const newComponent = {
      id: nextComponentId,
      type: "PySideButton",
      x: 50,
      y: 50,
      width: 200,
      height: 100,
      text: `Button ${nextComponentId}`,
      fontSize: 16,
      textColor: "#ffffff",
      backgroundColor: "#3b82f6",
      radius: 4,
      pressedColor: "#1d4ed8",
      hoverColor: "#60a5fa",
    };

    const updatedScreens = [...screens];
    updatedScreens[currentScreenIndex].components.push(newComponent);
    setScreens(updatedScreens);
    setNextComponentId(nextComponentId + 1);
    setSelectedComponentId(newComponent.id);
  };

  const addPySideLabel = () => {
    const newComponent = {
      id: nextComponentId,
      type: "PySideLabel",
      x: 50,
      y: 50,
      width: 150,
      height: 50,
      text: `Label ${nextComponentId}`,
      fontSize: 14,
      textColor: "#000000",
      backgroundColor: "#f0f0f0",
      radius: 0,
    };
    const updatedScreens = [...screens];
    updatedScreens[currentScreenIndex].components.push(newComponent);
    setScreens(updatedScreens);
    setNextComponentId(nextComponentId + 1);
    setSelectedComponentId(newComponent.id);
  };
  const addScreen = () => {
    const newScreen = {
      id: nextScreenId,
      name: `Screen ${nextScreenId + 1}`,
      components: [],
      backgroundColor: "#ffffff",
    };
    setScreens([...screens, newScreen]);
    setNextScreenId(nextScreenId + 1);
    setCurrentScreenIndex(screens.length);
  };

  const deleteScreen = (screenId) => {
    if (screens.length > 1) {
      const updatedScreens = screens.filter((screen) => screen.id !== screenId);
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
      components: screen.components.filter((component) => component.id !== id),
    }));
    setScreens(updatedScreens);
    if (selectedComponentId === id) {
      setSelectedComponentId(null);
    }
  };

  const resizeComponent = (id, newSizeAndPosition) => {
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
  const selectComponent = (id) => {
    setSelectedComponentId(id);
  };

  const duplicateComponent = () => {
    if (!selectedComponentId) return;

    let componentToDuplicate = null;
    let screenIndex = currentScreenIndex;

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

  const handleExport = () => {
    const pyCode = generatePySideCode(
      screens,
      currentScreenIndex,
      centerPanelDimensions
    );
    const blob = new Blob([pyCode], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ui.py";
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
        Math.min(appState.currentScreenIndex || 0, appState.screens.length - 1)
      );

      const highestId = Math.max(
        0,
        ...appState.screens
          .flatMap((screen) => screen.components.map((comp) => comp.id))
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

  const currentScreenComponents = screens[currentScreenIndex]?.components || [];
  const selectedComponent = currentScreenComponents.find(
    (c) => c.id === selectedComponentId
  );

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 overflow-hidden">
        <LeftPanel
          onAddPySideButton={addPySideButton}
          onAddPySideLabel={addPySideLabel}
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
            onResizeComponent={resizeComponent}
            onMoveComponent={moveComponent}
            onSelectComponent={selectComponent}
            selectedComponentId={selectedComponentId}
            backgroundColor={
              screens[currentScreenIndex]?.backgroundColor || "#ffffff"
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
          onDuplicateComponent={duplicateComponent}
        />
      </div>
    </div>
  );
}
