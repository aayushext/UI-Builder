import React, { useState } from "react";
import { IconContext } from "react-icons";
import { FaPlus } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";
import { useUIStore } from "../store/StateStore";

const ScreenTabs = () => {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    // Get state and actions directly from store
    const {
        screens,
        currentScreenIndex,
        setCurrentScreenIndex,
        addScreen,
        deleteScreen,
    } = useUIStore();

    return (
        <div className="flex items-center border-b border-gray-300 dark:border-gray-900 bg-gray-100 dark:bg-gray-600 px-4 py-2">
            {screens.map((screen, index) => (
                <div key={screen.id} className="flex items-center mr-2">
                    <button
                        onClick={() => setCurrentScreenIndex(index)}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        className={`flex items-center py-1 px-3 rounded-md ${
                            index === currentScreenIndex
                                ? "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 border-b-gray-400 dark:border-b-gray-800"
                                : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-800"
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
                                    className="flex hover:bg-red-500 dark:hover:bg-red-700 cursor-pointer text-xs font-bold rounded-full h-5 w-5 items-center justify-center">
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
                className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-900 py-2 px-2 rounded-md ml-2">
                <IconContext.Provider value={{ size: "1em" }}>
                    <div>
                        <FaPlus />
                    </div>
                </IconContext.Provider>
            </button>
        </div>
    );
};

export default ScreenTabs;
