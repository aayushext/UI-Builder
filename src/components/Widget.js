import { Rnd } from "react-rnd";

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
        border: isSelected ? "2px solid blue" : "1px solid black",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      bounds="parent"
      data-id={id}
      onResizeStop={(e, direction, ref, delta, position) => {
        onResize(id, { width: ref.offsetWidth, height: ref.offsetHeight });
      }}
      onDragStop={(e, d) => {
        onMove(id, { x: d.x, y: d.y });
      }}
      onClick={() => onSelect(id)}>
      <div className="relative w-full h-full">
        {children}
        <button
          onClick={() => onDelete(id)}
          className="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 rounded-full text-xs -mt-2 -mr-2">
          X
        </button>
      </div>
    </Rnd>
  );
};

export default Widget;
