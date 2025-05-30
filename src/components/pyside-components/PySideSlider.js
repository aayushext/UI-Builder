import React from "react";
import PropTypes from "prop-types";

const PySideSlider = ({
    width,
    height,
    minimum = 0,
    maximum = 100,
    value = 50,
    orientation = "horizontal",
    backgroundColor = "#000000ff",
    trackColor = "#c8c8c8",
    filledTrackColor,
    thumbColor,
    thumbSize: thumbSizeProp,
    trackWidth: trackThicknessProp = 8,
}) => {
    const isHorizontal = orientation === "horizontal";
    const trackThickness = Math.max(trackThicknessProp, 2);

    // Calculate dimensions for the track div element based on orientation and effective thickness
    const trackWidth = isHorizontal ? Math.max(width - 20, 8) : trackThickness;

    const trackHeight = isHorizontal
        ? trackThickness
        : Math.max(height - 20, 8);

    const range = maximum - minimum;
    const percentage = range > 0 ? (value - minimum) / range : 0;

    // Thumb size: use prop if provided, else auto-calculate
    const thumbSize =
        thumbSizeProp !== undefined
            ? thumbSizeProp
            : Math.min(Math.min(Math.max(height, 16), Math.max(width, 16)), 32);

    // Thumb color: use prop directly (should have a default from definitions)
    const thumbColorFinal = thumbColor;

    // Filled track color: use prop directly (should have a default from definitions)
    const filledTrackColorFinal = filledTrackColor;

    // Thumb position calculation needs the *length* of the track element
    const trackLength = isHorizontal ? trackWidth : trackHeight;

    const thumbPosition = isHorizontal
        ? percentage * (trackLength - thumbSize) + 10
        : (1 - percentage) * (trackLength - thumbSize) + 10;

    // Filled track position/size
    const filledTrackStyle = isHorizontal
        ? {
              left: "10px",
              top: `${height / 2 - trackHeight / 2}px`,
              width: `${percentage * trackWidth}px`,
              height: trackHeight,
              backgroundColor: filledTrackColorFinal,
          }
        : {
              left: `${width / 2 - trackWidth / 2}px`,
              top: `${10 + (1 - percentage) * trackHeight}px`,
              width: trackWidth,
              height: `${percentage * trackHeight}px`,
              backgroundColor: filledTrackColorFinal,
          };

    return (
        <div
            className="relative flex items-center justify-center overflow-visible rounded w-full h-full"
            style={{ backgroundColor }}>
            {/* Slider track */}
            <div
                className="absolute border border-slate-400 rounded z-10"
                style={{
                    left: isHorizontal
                        ? "10px"
                        : `${width / 2 - trackWidth / 2}px`,
                    top: isHorizontal
                        ? `${height / 2 - trackHeight / 2}px`
                        : "10px",
                    width: trackWidth,
                    height: trackHeight,
                    backgroundColor: trackColor,
                }}
            />

            {/* Slider filled track */}
            <div className="absolute rounded z-20" style={filledTrackStyle} />

            {/* Thumb */}
            <div
                className="absolute border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow z-30 motion-scale-in-[1.5] motion-opacity-in-[0%] motion-duration-[250ms] motion-ease-spring-bouncier"
                style={{
                    left: isHorizontal ? thumbPosition : `${width / 2}px`,
                    top: isHorizontal ? `${height / 2}px` : thumbPosition,
                    width: thumbSize,
                    height: thumbSize,
                    backgroundColor: thumbColorFinal,
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
    backgroundColor: PropTypes.string,
    trackColor: PropTypes.string,
    filledTrackColor: PropTypes.string,
    thumbColor: PropTypes.string,
    thumbSize: PropTypes.number,
    trackWidth: PropTypes.number,
};

export default PySideSlider;
