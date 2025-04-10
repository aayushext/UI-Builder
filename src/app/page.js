"use client";
import React, { useEffect, useRef, useState } from "react";
import LeftPanel from "../components/LeftPanel";
import CenterPanel from "../components/CenterPanel";
import RightPanel from "../components/RightPanel";
import ScreenTabs from "../components/ScreenTabs";
import {
    generatePythonLoaderCode,
    generateQtUiFile,
} from "../utils/generatePySideCode";
import { exportToUiFile, importFromUiFile } from "../utils/saveSystem";
import { useUIStore } from "../store/StateStore";

import JSZip from "jszip";

export default function Home() {
    const { selectComponent } = useUIStore();

    useEffect(() => {
        const inputElements = ["INPUT", "SELECT", "TEXTAREA"];
        let isAdjustingInput = false;

        const handleMouseDown = (event) => {
            if (inputElements.includes(event.target.tagName)) {
                isAdjustingInput = true;
                return;
            }

            let target = event.target;
            let insideRightPanelOrComponent = false;

            while (target) {
                if (target.dataset && target.dataset.id) {
                    insideRightPanelOrComponent = true;
                    break;
                }
                if (target.id === "right-panel") {
                    insideRightPanelOrComponent = true;
                    break;
                }
                target = target.parentNode;
            }

            if (!insideRightPanelOrComponent) {
                selectComponent(null);
            }
        };

        const handleMouseUp = () => {
            isAdjustingInput = false;
        };

        if (typeof window !== "undefined") {
            document.addEventListener("mousedown", handleMouseDown);
            document.addEventListener("mouseup", handleMouseUp);
        }

        return () => {
            if (typeof window !== "undefined") {
                document.removeEventListener("mousedown", handleMouseDown);
                document.removeEventListener("mouseup", handleMouseUp);
            }
        };
    }, [selectComponent]);

    return (
        <div className="flex flex-col h-screen">
            <div className="flex flex-1 overflow-hidden">
                <LeftPanel className="flex-shrink-0" />
                <div className="flex flex-col flex-1 min-w-0">
                    <ScreenTabs />
                    <CenterPanel />
                </div>
                <RightPanel className="flex-shrink-0" />
            </div>
        </div>
    );
}
