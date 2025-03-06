import React from "react";

const PySideSlider = ({
  width,
  height,
  minimum = 0,
  maximum = 100,
  value = 50,
  orientation = "horizontal",
  tickPosition = "both",
  tickInterval = 10,
  sliderColor = "#3b82f6",
  backgroundColor = "#f0f0f0",
}) => {
  // Calculate track dimensions and position
  const isHorizontal = orientation === "horizontal";
  const trackHeight = isHorizontal ? Math.min(height / 3, 8) : height - 20;
  const trackWidth = isHorizontal ? width - 20 : Math.min(width / 3, 8);

  // Calculate the thumb position
  const range = maximum - minimum;
  const percentage = range > 0 ? (value - minimum) / range : 0;
  const thumbSize = Math.min(Math.max(height, 16), Math.max(width, 16)) / 2;

  const thumbPosition = isHorizontal
    ? percentage * (width - 20 - thumbSize) + 10
    : (1 - percentage) * (height - 20 - thumbSize) + 10;

  const showTicks = tickPosition !== "none" && tickInterval > 0;

  // Generate tick marks if needed
  const renderTicks = () => {
    if (!showTicks || tickInterval <= 0 || range <= 0) return null;

    const ticks = [];
    const tickCount = Math.floor(range / tickInterval) + 1;

    for (let i = 0; i < tickCount; i++) {
      const tickPercentage = i / (tickCount - 1);
      const tickPosX = isHorizontal
        ? tickPercentage * (width - 20) + 10
        : width / 2;
      const tickPosY = isHorizontal
        ? height / 2
        : (1 - tickPercentage) * (height - 20) + 10;

      ticks.push(
        <div
          key={i}
          style={{
            position: "absolute",
            width: isHorizontal ? "1px" : "6px",
            height: isHorizontal ? "6px" : "1px",
            backgroundColor: "#888",
            left: tickPosX,
            top: tickPosY,
            transform: "translate(-50%, -50%)",
            zIndex: 1,
          }}
        />
      );
    }

    return ticks;
  };

  return (
    <div
      style={{
        position: "relative",
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: backgroundColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "visible",
        borderRadius: "4px",
      }}>
      {/* Show ticks */}
      {renderTicks()}

      {/* Slider track */}
      <div
        style={{
          position: "absolute",
          left: isHorizontal ? "10px" : `${width / 2 - trackWidth / 2}px`,
          top: isHorizontal ? `${height / 2 - trackHeight / 2}px` : "10px",
          width: trackWidth,
          height: trackHeight,
          backgroundColor: "#ccc",
          borderRadius: "4px",
          zIndex: 2,
        }}
      />

      {/* Slider filled track */}
      <div
        style={{
          position: "absolute",
          left: isHorizontal ? "10px" : `${width / 2 - trackWidth / 2}px`,
          top: isHorizontal
            ? `${height / 2 - trackHeight / 2}px`
            : `${height - 10 - percentage * trackHeight}px`,
          width: isHorizontal ? `${percentage * trackWidth}px` : trackWidth,
          height: isHorizontal ? trackHeight : `${percentage * trackHeight}px`,
          backgroundColor: sliderColor,
          borderRadius: "4px",
          zIndex: 3,
        }}
      />

      {/* Thumb */}
      <div
        style={{
          position: "absolute",
          left: isHorizontal ? thumbPosition : `${width / 2}px`,
          top: isHorizontal ? `${height / 2}px` : thumbPosition,
          width: thumbSize,
          height: thumbSize,
          backgroundColor: sliderColor,
          border: "2px solid white",
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          zIndex: 4,
        }}
      />
    </div>
  );
};

export default PySideSlider;
