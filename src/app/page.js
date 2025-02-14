"use client";
import { useState, useEffect, useRef } from "react";
import LeftPanel from "@/components/LeftPanel";
import CenterPanel from "@/components/CenterPanel";
import RightPanel from "@/components/RightPanel";
import { generatePySideCode } from "@/utils/generatePySideCode";

export default function Home() {
  const [components, setComponents] = useState([]);
  const [nextId, setNextId] = useState(0);
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const [centerPanelBackgroundColor, setCenterPanelBackgroundColor] =
    useState("#ffffff");
  const centerPanelRef = useRef(null);
  const [centerPanelDimensions, setCenterPanelDimensions] = useState({
    width: 1000,
    height: 1000,
  });

  // Function to add a PySideButton
  const addPySideButton = () => {
    const newComponent = {
      id: nextId,
      type: "PySideButton",
      x: 50,
      y: 50,
      width: 200,
      height: 100,
      text: `Button ${nextId}`,
      fontSize: 16,
      textColor: "#ffffff",
      backgroundColor: "#3b82f6",
      radius: 4,
      pressedColor: "#1d4ed8",
      hoverColor: "#60a5fa", // Add hoverColor
    };
    setComponents([...components, newComponent]);
    setNextId(nextId + 1);
  };

  // Function to add a PySideLabel (no changes needed)
  const addPySideLabel = () => {
    const newComponent = {
      id: nextId,
      type: "PySideLabel",
      x: 50,
      y: 50,
      width: 150,
      height: 50,
      text: `Label ${nextId}`,
      fontSize: 14,
      textColor: "#000000",
      backgroundColor: "#f0f0f0",
      radius: 0,
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

  const resizeComponent = (id, newSizeAndPosition) => {
    setComponents(
      components.map((component) =>
        component.id === id
          ? { ...component, ...newSizeAndPosition }
          : component
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
    const pyCode = generatePySideCode(
      components,
      centerPanelBackgroundColor,
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

  return (
    <div className="flex h-screen">
      <LeftPanel
        onAddPySideButton={addPySideButton}
        onAddPySideLabel={addPySideLabel}
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
