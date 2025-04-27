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
    trackColor = "#c8c8c8",
    trackWidth = 8,
}) => {
    const isHorizontal = orientation === "horizontal";
    const actualTrackHeight = isHorizontal
        ? Math.max(trackWidth, 2)
        : height - 20;
    const actualTrackWidth = isHorizontal
        ? width - 20
        : Math.max(trackWidth, 2);

    const range = maximum - minimum;
    const percentage = range > 0 ? (value - minimum) / range : 0;
    const thumbSize = Math.min(
        Math.max(isHorizontal ? height * 0.8 : width * 0.8, trackWidth + 4, 16),
        32
    );

    const thumbPosition = isHorizontal
        ? percentage * (actualTrackWidth - thumbSize) + 10 + thumbSize / 2
        : (1 - percentage) * (actualTrackHeight - thumbSize) +
          10 +
          thumbSize / 2;

    return (
        <div
            className="relative flex items-center justify-center overflow-visible rounded w-full h-full"
            style={{ backgroundColor }}>
            {/* Slider track */}
            <div
                className="absolute border border-gray-400 rounded z-10"
                style={{
                    left: isHorizontal
                        ? "10px"
                        : `${width / 2 - actualTrackWidth / 2}px`,
                    top: isHorizontal
                        ? `${height / 2 - actualTrackHeight / 2}px`
                        : "10px",
                    width: actualTrackWidth,
                    height: actualTrackHeight,
                    backgroundColor: trackColor,
                    borderRadius: `${Math.round(trackWidth / 2)}px`,
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
                className="absolute border border-gray-600 rounded-full -translate-x-1/2 -translate-y-1/2 shadow z-30"
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
    trackColor: PropTypes.string,
    trackWidth: PropTypes.number,
};

export default PySideSlider;
