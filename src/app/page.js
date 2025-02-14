"use client";
import { useState, useEffect, useRef } from "react";
import LeftPanel from "@/components/LeftPanel";
import CenterPanel from "@/components/CenterPanel";
import RightPanel from "@/components/RightPanel";
import { generateKvString } from "@/utils/generateKvString";

export default function Home() {
  const [components, setComponents] = useState([]);
  const [nextId, setNextId] = useState(0);
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const [centerPanelBackgroundColor, setCenterPanelBackgroundColor] =
    useState("#ffffff");
  const centerPanelRef = useRef(null);
  const [centerPanelDimensions, setCenterPanelDimensions] = useState({
    width: 1080,
    height: 720,
  });

  const addKivyButton = () => {
    const newComponent = {
      id: nextId,
      type: "KivyButton",
      x: 50,
      y: 50,
      width: 200,
      height: 100,
      text: `Button ${nextId}`,
      fontSize: 16,
      textColor: "#ffffff",
      backgroundColor: "#3b82f6",
      radius: 0,
      pressedColor: "#1d4ed8",
    };
    setComponents([...components, newComponent]);
    setNextId(nextId + 1);
  };

  // Function to add a KivyLabel
  const addKivyLabel = () => {
    const newComponent = {
      id: nextId,
      type: "KivyLabel", // Set type to KivyLabel
      x: 50,
      y: 50,
      width: 150,
      height: 50,
      text: `Label ${nextId}`,
      fontSize: 14,
      textColor: "#000000", // Black text color
      backgroundColor: "#f0f0f0", // Light gray background
      radius: 0, // No radius by default
    };
    setComponents([...components, newComponent]);
    setNextId(nextId + 1);
  };
  const deleteComponent = (id) => {
    setComponents(components.filter((component) => component.id !== id));
    if (selectedComponentId === id) {
      setSelectedComponentId(null);
    }
  };
  const resizeComponent = (id, newSize) => {
    setComponents(
      components.map((component) =>
        component.id === id ? { ...component, ...newSize } : component
      )
    );
  };

  const moveComponent = (id, newPosition) => {
    setComponents(
      components.map((component) =>
        component.id === id
          ? { ...component, x: newPosition.x, y: newPosition.y }
          : component
      )
    );
  };

  const updateComponentProps = (id, newProps) => {
    setComponents(
      components.map((component) =>
        component.id === id ? { ...component, ...newProps } : component
      )
    );
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
  }, [components, centerPanelBackgroundColor]);

  const handleExport = () => {
    const kvString = generateKvString(
      components,
      centerPanelBackgroundColor,
      centerPanelDimensions
    );
    const blob = new Blob([kvString], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ui.kv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen">
      <LeftPanel
        onAddKivyButton={addKivyButton}
        onAddKivyLabel={addKivyLabel}
        onExport={handleExport}
      />
      <CenterPanel
        ref={centerPanelRef}
        components={components}
        onDeleteComponent={deleteComponent}
        onResizeComponent={resizeComponent}
        onMoveComponent={moveComponent}
        onSelectComponent={selectComponent}
        selectedComponentId={selectedComponentId}
        backgroundColor={centerPanelBackgroundColor}
      />
      <RightPanel
        selectedComponent={components.find((c) => c.id === selectedComponentId)}
        onUpdateComponentProps={updateComponentProps}
        centerPanelBackgroundColor={centerPanelBackgroundColor}
        onUpdateCenterPanelBackgroundColor={setCenterPanelBackgroundColor}
      />
    </div>
  );
}
