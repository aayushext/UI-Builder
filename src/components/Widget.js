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
      position={{ x: x, y: y }} // Use current position
      size={{ width: width, height: height }}
      style={{
        border: isSelected ? "2px solid blue" : "1px solid black",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      bounds="parent"
      data-id={id}
      onResizeStop={(e, direction, ref, delta, position) => {
        // Update BOTH size AND position
        onResize(id, {
          width: ref.offsetWidth,
          height: ref.offsetHeight,
          x: position.x, // Use the updated x from onResizeStop
          y: position.y, // Use the updated y from onResizeStop
        });
      }}
      onDragStop={(e, d) => {
        onMove(id, { x: d.x, y: d.y });
      }}
      onClick={() => onSelect(id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <div className="relative w-full h-full">
        {children}
        {(isHovered || isSelected) && (
          <button
            onClick={() => onDelete(id)}
            className="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 rounded-full text-xs -mt-2 -mr-2">
            X
          </button>
        )}
      </div>
    </Rnd>
  );
};

export default Widget;
