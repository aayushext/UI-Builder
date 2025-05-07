import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { IconContext } from "react-icons";
import { FaPlus } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";
import { useAppStore } from "../store/useAppStore";

const ScreenTabs = () => {
    const screens = useAppStore((s) => s.screens);
    const currentScreenIndex = useAppStore((s) => s.currentScreenIndex);
    const setCurrentScreenIndex = useAppStore((s) => s.setCurrentScreenIndex);
    const addScreen = useAppStore((s) => s.addScreen);
    const deleteScreen = useAppStore((s) => s.deleteScreen);

    const [hoveredIndex, setHoveredIndex] = useState(null);
    const tabRefs = useRef([]);

    useEffect(() => {
        tabRefs.current = tabRefs.current.slice(0, screens.length);
    }, [screens.length]);

    const handleKeyDown = (e, index) => {
        let nextIndex = -1;
        if (e.key === "ArrowLeft") {
            nextIndex = index > 0 ? index - 1 : screens.length - 1;
        } else if (e.key === "ArrowRight") {
            nextIndex = index < screens.length - 1 ? index + 1 : 0;
        } else if (e.key === "Enter" || e.key === " ") {
            setCurrentScreenIndex(index);
            e.preventDefault();
        } else if (e.key === "Delete" && screens.length > 1) {
            deleteScreen(screens[index].id);
            e.preventDefault();
        }

        if (nextIndex !== -1) {
            setCurrentScreenIndex(nextIndex);
            tabRefs.current[nextIndex]?.focus();
            e.preventDefault();
        }
    };

    return (
        <div
            className="flex items-center border-b border-slate-300 dark:border-slate-900 bg-slate-100 dark:bg-slate-700 px-4 py-2 motion-translate-x-in-[0%] motion-translate-y-in-[-75%] motion-duration-[500ms] motion-delay-[100ms] motion-delay-[0ms]/translate"
            role="tablist"
            aria-label="Screens">
            {screens.map((screen, index) => (
                <div
                    key={screen.id}
                    className="flex items-center mr-2 motion-scale-in-[1.5] motion-opacity-in-[0%] motion-delay-[0ms] motion-delay-[0ms]/scale motion-delay-[0ms]/opacity motion-ease-spring-bouncier">
                    <button
                        ref={(el) => (tabRefs.current[index] = el)}
                        id={`screen-tab-${screen.id}`}
                        role="tab"
                        aria-selected={index === currentScreenIndex}
                        aria-controls={`screen-panel-${screen.id}`}
                        tabIndex={index === currentScreenIndex ? 0 : -1}
                        onClick={() => setCurrentScreenIndex(index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        className={`flex items-center py-1 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            index === currentScreenIndex
                                ? "bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 border-b-slate-400 dark:border-b-slate-800"
                                : "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-800"
                        }`}>
                        {screen.name}
                        <div
                            className={`transition-all duration-200 ease-in-out flex items-center justify-center overflow-hidden ${
                                screens.length > 1 &&
                                (index === currentScreenIndex ||
                                    index === hoveredIndex)
                                    ? "w-6 ml-2 -mr-2 opacity-100"
                                    : "w-0 opacity-0"
                            }`}>
                            {screens.length > 1 && (
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteScreen(screen.id);
                                    }}
                                    className="flex hover:bg-red-500 dark:hover:bg-red-700 cursor-pointer text-xs font-bold rounded-full h-5 w-5 items-center justify-center"
                                    aria-label={`Delete ${screen.name}`}>
                                    <IconContext.Provider
                                        value={{ size: "1em" }}>
                                        <div>
                                            <IoMdClose />
                                        </div>
                                    </IconContext.Provider>
                                </div>
                            )}
                        </div>
                    </button>
                </div>
            ))}
            <button
                onClick={addScreen}
                className="bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-900 py-2 px-2 rounded-md ml-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 motion-scale-in-[1.5] motion-opacity-in-[0%] motion-delay-[100ms] motion-delay-[100ms]/scale motion-delay-[100ms]/opacity motion-ease-spring-bouncier"
                aria-label="Add new screen">
                <IconContext.Provider value={{ size: "1em" }}>
                    <div>
                        <FaPlus />
                    </div>
                </IconContext.Provider>
            </button>
        </div>
    );
};

ScreenTabs.propTypes = {};

export default ScreenTabs;
