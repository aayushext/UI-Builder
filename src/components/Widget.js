import { Rnd } from "react-rnd";
import { useState } from "react";

const Widget = ({
  id,
  onDelete,
  x,
  y,
  width,
  height,
  children,
  onResize,
  onMove,
  onSelect,
  isSelected,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Rnd
      default={{
        x: x,
        y: y,
        width: width,
        height: height,
      }}
      position={{ x: x, y: y }}
      size={{ width: width, height: height }}
      style={{
        border: isSelected ? "2px solid blue" : "0px solid black",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      bounds="parent"
      data-id={id}
      onResizeStop={(e, direction, ref, delta, position) => {
        onResize(id, {
          width: ref.offsetWidth,
          height: ref.offsetHeight,
          x: position.x,
          y: position.y,
        });
      }}
      onDragStop={(e, d) => {
        onMove(id, { x: d.x, y: d.y });
      }}
      onClick={() => onSelect(id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <div className="relative w-full h-full">
        {(isHovered || isSelected) && (
          <button
            onClick={() => onDelete(id)}
            className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded-full text-xs -mt-3 -mr-3 w-6 h-6 flex items-center justify-center shadow-sm transition"
            style={{ minWidth: "24px", touchAction: "manipulation" }}>
            X
          </button>
        )}
        {children}
      </div>
    </Rnd>
  );
};

export default Widget;
