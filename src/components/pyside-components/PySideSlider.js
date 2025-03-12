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
    backgroundColor = "#000000ff",
}) => {
    // Calculate track dimensions and position
    const isHorizontal = orientation === "horizontal";
    const trackHeight = isHorizontal
        ? Math.max(Math.min(height / 3, 12), 8)
        : height - 20;
    const trackWidth = isHorizontal
        ? Math.max(width - 20, 8)
        : Math.min(width / 3, 8);

    // Calculate the thumb position
    const range = maximum - minimum;
    const percentage = range > 0 ? (value - minimum) / range : 0;
    const thumbSize = Math.min(
        Math.min(Math.max(height, 16), Math.max(width, 16)),
        32
    );

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
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-0 bg-gray-500"
                    style={{
                        width: isHorizontal ? "1px" : "6px",
                        height: isHorizontal ? "6px" : "1px",
                        left: tickPosX,
                        top: tickPosY,
                    }}
                />
            );
        }

        return ticks;
    };

    return (
        <div
            className="relative flex items-center justify-center overflow-visible rounded w-full h-full"
            style={{ backgroundColor }}>
            {/* Show ticks */}
            {renderTicks()}

            {/* Slider track */}
            <div
                className="absolute bg-gray-300 border border-gray-400 rounded z-10"
                style={{
                    left: isHorizontal
                        ? "10px"
                        : `${width / 2 - trackWidth / 2}px`,
                    top: isHorizontal
                        ? `${height / 2 - trackHeight / 2}px`
                        : "10px",
                    width: trackWidth,
                    height: trackHeight,
                }}
            />

            {/* Slider filled track */}
            <div
                className="absolute rounded z-20"
                style={{
                    left: isHorizontal
                        ? "10px"
                        : `${width / 2 - trackWidth / 2}px`,
                    top: isHorizontal
                        ? `${height / 2 - trackHeight / 2}px`
                        : `${height - 10 - percentage * trackHeight}px`,
                    width: isHorizontal
                        ? `${percentage * trackWidth}px`
                        : trackWidth,
                    height: isHorizontal
                        ? trackHeight
                        : `${percentage * trackHeight}px`,
                    backgroundColor: sliderColor,
                }}
            />

            {/* Thumb */}
            <div
                className="absolute border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow z-30"
                style={{
                    left: isHorizontal ? thumbPosition : `${width / 2}px`,
                    top: isHorizontal ? `${height / 2}px` : thumbPosition,
                    width: thumbSize,
                    height: thumbSize,
                    backgroundColor: sliderColor,
                }}
            />
        </div>
    );
};

export default PySideSlider;
