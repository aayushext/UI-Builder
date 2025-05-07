import React from "react";
import PropTypes from "prop-types";

const PySideSlider = ({
    width,
    height,
    minimum = 0,
    maximum = 100,
    value = 50,
    orientation = "horizontal",
    sliderColor = "#3b82f6",
    backgroundColor = "#000000ff",
}) => {
    const isHorizontal = orientation === "horizontal";
    const trackHeight = isHorizontal
        ? Math.max(Math.min(height / 3, 12), 8)
        : height - 20;
    const trackWidth = isHorizontal
        ? Math.max(width - 20, 8)
        : Math.min(width / 3, 8);

    const range = maximum - minimum;
    const percentage = range > 0 ? (value - minimum) / range : 0;
    const thumbSize = Math.min(
        Math.min(Math.max(height, 16), Math.max(width, 16)),
        32
    );

    const thumbPosition = isHorizontal
        ? percentage * (width - 20 - thumbSize) + 10
        : (1 - percentage) * (height - 20 - thumbSize) + 10;

    return (
        <div
            className="relative flex items-center justify-center overflow-visible rounded w-full h-full"
            style={{ backgroundColor }}>
            {/* Slider track */}
            <div
                className="absolute bg-slate-300 border border-slate-400 rounded z-10"
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
                className="absolute border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow z-30 motion-scale-in-[1.5] motion-opacity-in-[0%] motion-duration-[250ms] motion-ease-spring-bouncier"
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

PySideSlider.propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    minimum: PropTypes.number,
    maximum: PropTypes.number,
    value: PropTypes.number,
    orientation: PropTypes.oneOf(["horizontal", "vertical"]),
    sliderColor: PropTypes.string,
    backgroundColor: PropTypes.string,
};

export default PySideSlider;
