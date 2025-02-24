"use client";
import { useState, useEffect, useRef } from "react";
import LeftPanel from "../components/LeftPanel";
import CenterPanel from "../components/CenterPanel";
import RightPanel from "../components/RightPanel";
import { generatePySideCode } from "../utils/generatePySideCode";

export default function Home() {
  const [screens, setScreens] = useState([
    { id: 0, name: "Screen 1", components: [], backgroundColor: "#ffffff" },
  ]); // Array of screens
  const [nextScreenId, setNextScreenId] = useState(1);
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0); // Index of the currently active screen
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
  };
  const addScreen = () => {
    const newScreen = {
      id: nextScreenId,
      name: `Screen ${nextScreenId + 1}`,
      components: [],
      backgroundColor: "#ffffff", // Default background color
    };
    setScreens([...screens, newScreen]);
    setNextScreenId(nextScreenId + 1);
    setCurrentScreenIndex(screens.length); // Switch to the new screen
  };

  const deleteScreen = (screenId) => {
    if (screens.length > 1) {
      // Prevent deleting the last screen
      const updatedScreens = screens.filter((screen) => screen.id !== screenId);
      setScreens(updatedScreens);
      // If the current screen was deleted, switch to the previous one
      if (currentScreenIndex >= updatedScreens.length) {
        setCurrentScreenIndex(updatedScreens.length - 1);
      }
      setSelectedComponentId(null); //clear selection
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

  useEffect(() => {
    const handleDocumentClick = (event) => {
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
    if (typeof window !== "undefined") {
      document.addEventListener("click", handleDocumentClick);
    }
    return () => {
      if (typeof window !== "undefined") {
        document.removeEventListener("click", handleDocumentClick);
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
  }, [screens, currentScreenIndex]); // Re-calculate dimensions when screens or currentScreen change

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
  // Get the components of the currently active screen
  const currentScreenComponents = screens[currentScreenIndex]?.components || [];
  // Find the selected component within the current screen
  const selectedComponent = currentScreenComponents.find(
    (c) => c.id === selectedComponentId
  );

  return (
    <div className="flex h-screen">
      <LeftPanel
        onAddPySideButton={addPySideButton}
        onAddPySideLabel={addPySideLabel}
        onAddScreen={addScreen} // Add screen controls
        onDeleteScreen={deleteScreen}
        screens={screens}
        currentScreenIndex={currentScreenIndex}
        onScreenChange={setCurrentScreenIndex}
        onExport={handleExport}
      />
      <CenterPanel
        ref={centerPanelRef}
        components={currentScreenComponents} // Pass components of the current screen
        onDeleteComponent={deleteComponent}
        onResizeComponent={resizeComponent}
        onMoveComponent={moveComponent}
        onSelectComponent={selectComponent}
        selectedComponentId={selectedComponentId}
        backgroundColor={
          screens[currentScreenIndex]?.backgroundColor || "#ffffff"
        } // Current screen bg
      />
      <RightPanel
        selectedComponent={selectedComponent} // Pass selected component
        onUpdateComponentProps={updateComponentProps}
        currentScreen={screens[currentScreenIndex]}
        onUpdateScreenBackgroundColor={(color) =>
          updateScreenBackgroundColor(currentScreenIndex, color)
        } //update background
      />
    </div>
  );
}
