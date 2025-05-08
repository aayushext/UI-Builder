import { generateQtUiFile } from "@/utils/generatePySideCode";
import { rgbaToHex } from "@/utils/colorUtils";

/**
 * Parses an rgba color string into a hex color string (#RRGGBB or #RRGGBBAA).
 * @param {string} rgbaStr - The rgba color string (e.g., "rgba(255, 0, 0, 0.5)").
 * @returns {string} The hex color string, or #000000 if parsing fails.
 */
const parseRgba = rgbaToHex;

/**
 * Exports the current design screens to a downloadable .ui file.
 * @param {Array} screens - Array of screen objects.
 * @param {number} currentScreenIndex - Index of the currently active screen.
 */
export const exportToUiFile = (screens, currentScreenIndex) => {
    try {
        const uiFile = generateQtUiFile(screens, currentScreenIndex);
        const blob = new Blob([uiFile], {
            type: "application/xml;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "ui-design.ui";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Failed to export UI file:", error);
        alert(`Error exporting UI file: ${error.message}`);
    }
};

/**
 * Imports application state from a .ui file.
 * @param {File} file - The .ui file to import.
 * @returns {Promise<object>} A promise that resolves with the parsed application state object
 *                            (containing screens, next IDs, etc.) or rejects with an error.
 */
export const importFromUiFile = (file) => {
    return new Promise((resolve, reject) => {
        if (!file || !file.name.endsWith(".ui")) {
            return reject(
                new Error("Invalid file type. Please select a .ui file.")
            );
        }

        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(
                    event.target.result,
                    "text/xml"
                );

                const parserError = xmlDoc.querySelector("parsererror");
                if (parserError) {
                    throw new Error(
                        `XML parsing error: ${parserError.textContent}`
                    );
                }

                const appState = parseUiFile(xmlDoc);
                resolve(appState);
            } catch (error) {
                console.error("Error parsing UI file:", error);
                reject(
                    new Error(
                        `Failed to parse UI file: ${error.message}. Please ensure it's a valid Qt Designer file.`
                    )
                );
            }
        };

        reader.onerror = (event) => {
            console.error("File reading error:", event.target.error);
            reject(new Error(`Failed to read file: ${event.target.error}`));
        };

        reader.readAsText(file);
    });
};

/**
 * Recursively parses a widget element from the XML DOM into a component object.
 * @param {Element} componentWidget - The XML element representing the widget.
 * @param {number | null} parentId - The ID of the parent component (null for top-level).
 * @param {{value: number}} nextComponentIdRef - A reference object to track the next available component ID.
 * @returns {Array<object>} An array containing the parsed component and any parsed descendants.
 * @private
 */
const parseComponentWidget = (
    componentWidget,
    parentId,
    nextComponentIdRef
) => {
    const componentTypeQt = componentWidget.getAttribute("class");
    const componentId = componentWidget.getAttribute("name");

    const typeMap = {
        QPushButton: "PySideButton",
        QLabel: "PySideLabel",
        QSlider: "PySideSlider",
        QFrame: "PySideFrame",
    };

    if (!typeMap[componentTypeQt]) {
        return [];
    }

    const currentId = nextComponentIdRef.value++;
    const component = {
        id: currentId,
        type: typeMap[componentTypeQt],
        componentId,
        parentId,
    };

    const geometry = componentWidget.querySelector(
        ":scope > property[name='geometry'] > rect"
    );
    if (geometry) {
        component.x = parseInt(geometry.querySelector("x").textContent);
        component.y = parseInt(geometry.querySelector("y").textContent);
        component.width = parseInt(geometry.querySelector("width").textContent);
        component.height = parseInt(
            geometry.querySelector("height").textContent
        );
    } else {
        component.x = 0;
        component.y = 0;
        component.width = 100;
        component.height = 30;
    }

    const componentStyle = componentWidget.querySelector(
        ":scope > property[name='styleSheet'] > string"
    );

    if (component.type === "PySideButton" || component.type === "PySideLabel") {
        const textProp = componentWidget.querySelector(
            ":scope > property[name='text'] > string"
        );
        component.text = textProp ? textProp.textContent : "";

        if (componentStyle) {
            const content = componentStyle.textContent;
            const fontSizeMatch = content.match(/font-size:\s*(\d+)px/);
            if (fontSizeMatch) component.fontSize = parseInt(fontSizeMatch[1]);
            const textColorMatch = content.match(/color:\s*rgba\(([^)]+)\)/);
            if (textColorMatch)
                component.textColor = parseRgba(`rgba(${textColorMatch[1]})`);
            const bgColorMatch = content.match(
                /background-color:\s*rgba\(([^)]+)\)/
            );
            if (bgColorMatch)
                component.backgroundColor = parseRgba(
                    `rgba(${bgColorMatch[1]})`
                );
            const radiusMatch = content.match(/border-radius:\s*(\d+)px/);
            if (radiusMatch) component.radius = parseInt(radiusMatch[1]);

            const borderMatch = content.match(
                /border:\s*(\d+)px solid rgba\(([^)]+)\)/
            );
            if (borderMatch) {
                component.borderWidth = parseInt(borderMatch[1]);
                component.borderColor = parseRgba(`rgba(${borderMatch[2]})`);
            }

            if (component.type === "PySideButton") {
                const hoverColorMatch = content.match(
                    /QPushButton:hover\s*{[^}]*background-color:\s*rgba\(([^)]+)\)/
                );
                if (hoverColorMatch)
                    component.hoverColor = parseRgba(
                        `rgba(${hoverColorMatch[1]})`
                    );
                const pressedColorMatch = content.match(
                    /QPushButton:pressed\s*{[^}]*background-color:\s*rgba\(([^)]+)\)/
                );
                if (pressedColorMatch)
                    component.pressedColor = parseRgba(
                        `rgba(${pressedColorMatch[1]})`
                    );
                const hoverBorderMatch = content.match(
                    /QPushButton:hover\s*{[^}]*border-color:\s*rgba\(([^)]+)\)/
                );
                if (hoverBorderMatch)
                    component.hoverBorderColor = parseRgba(
                        `rgba(${hoverBorderMatch[1]})`
                    );
                const pressedBorderMatch = content.match(
                    /QPushButton:pressed\s*{[^}]*border-color:\s*rgba\(([^)]+)\)/
                );
                if (pressedBorderMatch)
                    component.pressedBorderColor = parseRgba(
                        `rgba(${pressedBorderMatch[1]})`
                    );
            } else if (component.type === "PySideLabel") {
                const textAlignMatch = content.match(/text-align:\s*(\w+)/);
                if (textAlignMatch) component.textAlign = textAlignMatch[1];
                const alignmentProp = componentWidget.querySelector(
                    ":scope > property[name='alignment'] > set"
                );
                if (alignmentProp) {
                    const alignText = alignmentProp.textContent;
                    if (alignText.includes("AlignLeft"))
                        component.textAlign = "left";
                    else if (alignText.includes("AlignRight"))
                        component.textAlign = "right";
                    else if (alignText.includes("AlignCenter"))
                        component.textAlign = "center";
                }
                if (component.borderWidth === undefined) {
                    const labelBorderMatch = content.match(
                        /border:\s*1px solid rgba\(([^)]+)\)/
                    );
                    if (labelBorderMatch) {
                        component.borderWidth = 1;
                        component.borderColor = parseRgba(
                            `rgba(${labelBorderMatch[1]})`
                        );
                    }
                }
            }
        }
    } else if (component.type === "PySideSlider") {
        const minProp = componentWidget.querySelector(
            ":scope > property[name='minimum'] > number"
        );
        if (minProp) component.minimum = parseInt(minProp.textContent);
        const maxProp = componentWidget.querySelector(
            ":scope > property[name='maximum'] > number"
        );
        if (maxProp) component.maximum = parseInt(maxProp.textContent);
        const valueProp = componentWidget.querySelector(
            ":scope > property[name='value'] > number"
        );
        if (valueProp) component.value = parseInt(valueProp.textContent);
        const orientationProp = componentWidget.querySelector(
            ":scope > property[name='orientation'] > enum"
        );
        if (orientationProp)
            component.orientation = orientationProp.textContent.includes(
                "Vertical"
            )
                ? "vertical"
                : "horizontal";

        if (componentStyle) {
            const handleColorMatch = componentStyle.textContent.match(
                /QSlider::handle[^{]*{[^}]*background:\s*rgba\(([^)]+)\)/
            );
            if (handleColorMatch)
                component.sliderColor = parseRgba(
                    `rgba(${handleColorMatch[1]})`
                );
            const bgColorMatch = componentStyle.textContent.match(
                /QSlider\s*{[^}]*background-color:\s*rgba\(([^)]+)\)/
            );
            if (bgColorMatch)
                component.backgroundColor = parseRgba(
                    `rgba(${bgColorMatch[1]})`
                );
            const trackColorMatch = componentStyle.textContent.match(
                /QSlider::groove[^}]*background:\s*rgba\(([^)]+)\)/
            );
            if (trackColorMatch)
                component.trackColor = parseRgba(`rgba(${trackColorMatch[1]})`);

            const trackWidthMatch = componentStyle.textContent.match(
                /QSlider::groove:horizontal\s*{[^}]*height:\s*(\d+)px/
            );
            if (trackWidthMatch) {
                component.trackWidth = parseInt(trackWidthMatch[1]);
            } else {
                const trackWidthVerticalMatch =
                    componentStyle.textContent.match(
                        /QSlider::groove:vertical\s*{[^}]*width:\s*(\d+)px/
                    );
                if (trackWidthVerticalMatch)
                    component.trackWidth = parseInt(trackWidthVerticalMatch[1]);
            }
        }
    } else if (component.type === "PySideFrame") {
        if (componentStyle) {
            const bgColorMatch = componentStyle.textContent.match(
                /background-color:\s*rgba\(([^)]+)\)/
            );
            if (bgColorMatch)
                component.backgroundColor = parseRgba(
                    `rgba(${bgColorMatch[1]})`
                );

            const radiusMatch = componentStyle.textContent.match(
                /border-radius:\s*(\d+)px/
            );
            if (radiusMatch) component.radius = parseInt(radiusMatch[1]);

            const borderMatch = componentStyle.textContent.match(
                /border:\s*(\d+)px solid rgba\(([^)]+)\)/
            );
            if (borderMatch) {
                component.borderWidth = parseInt(borderMatch[1]);
                component.borderColor = parseRgba(`rgba(${borderMatch[2]})`);
                component.useCustomBorder = true;
            } else {
                component.useCustomBorder = false;
            }
        }

        const shapeProp = componentWidget.querySelector(
            ":scope > property[name='frameShape'] > enum"
        );
        if (shapeProp)
            component.frameShape = shapeProp.textContent.replace(
                "QFrame::",
                ""
            );
        const shadowProp = componentWidget.querySelector(
            ":scope > property[name='frameShadow'] > enum"
        );
        if (shadowProp)
            component.frameShadow = shadowProp.textContent.replace(
                "QFrame::",
                ""
            );
        const lineProp = componentWidget.querySelector(
            ":scope > property[name='lineWidth'] > number"
        );
        if (lineProp) component.lineWidth = parseInt(lineProp.textContent);
        const midLineProp = componentWidget.querySelector(
            ":scope > property[name='midLineWidth'] > number"
        );
        if (midLineProp)
            component.midLineWidth = parseInt(midLineProp.textContent);
    }

    setDefaultProperties(component);
    let parsedComponents = [component];

    if (component.type === "PySideFrame") {
        const childWidgets =
            componentWidget.querySelectorAll(":scope > widget");
        childWidgets.forEach((childWidget) => {
            parsedComponents = parsedComponents.concat(
                parseComponentWidget(childWidget, currentId, nextComponentIdRef)
            );
        });
    }

    return parsedComponents;
};

/**
 * Parses the entire .ui file XML document into an application state object.
 * @param {XMLDocument} xmlDoc - The parsed XML document.
 * @returns {object} The application state object { screens, nextScreenId, currentScreenIndex, nextComponentId }.
 * @throws {Error} If the expected structure (QMainWindow > QStackedWidget > QWidget) is not found.
 * @private
 */
const parseUiFile = (xmlDoc) => {
    const screens = [];
    let nextComponentIdRef = { value: 0 };

    const mainWindow = xmlDoc.querySelector("widget[class='QMainWindow']");
    if (!mainWindow) throw new Error("QMainWindow widget not found in UI file");

    const mainGeometry = mainWindow.querySelector(
        "property[name='geometry'] rect"
    );
    const defaultWidth = mainGeometry
        ? parseInt(mainGeometry.querySelector("width").textContent)
        : 1280;
    const defaultHeight = mainGeometry
        ? parseInt(mainGeometry.querySelector("height").textContent)
        : 800;

    const stackedWidget = mainWindow.querySelector(
        "widget[class='QStackedWidget']"
    );
    if (!stackedWidget) throw new Error("QStackedWidget not found in UI file");

    const screenWidgets = stackedWidget.querySelectorAll(
        ":scope > widget[class='QWidget']"
    ); // Direct children only

    screenWidgets.forEach((screenWidget, screenIndex) => {
        const screenName =
            screenWidget.getAttribute("name") || `screen_${screenIndex}`;
        const screenNumMatch = screenName.match(/_(\d+)$/);
        const screenNum = screenNumMatch
            ? parseInt(screenNumMatch[1]) + 1
            : screenIndex + 1;

        const styleSheet = screenWidget.querySelector(
            ":scope > property[name='styleSheet'] > string"
        );
        let backgroundColor = "#ffffff";
        if (styleSheet) {
            const bgColorMatch = styleSheet.textContent.match(
                /background-color:\s*rgba\(([^)]+)\)/
            );
            if (bgColorMatch) {
                backgroundColor = parseRgba(`rgba(${bgColorMatch[1]})`);
            }
        }

        const screen = {
            id: screenIndex,
            name: `Screen ${screenNum}`,
            customId: screenName,
            components: [],
            backgroundColor,
            width: defaultWidth,
            height: defaultHeight,
        };

        const componentWidgets =
            screenWidget.querySelectorAll(":scope > widget");
        componentWidgets.forEach((componentWidget) => {
            screen.components.push(
                ...parseComponentWidget(
                    componentWidget,
                    null,
                    nextComponentIdRef
                )
            );
        });

        screens.push(screen);
    });

    return {
        screens,
        nextScreenId: screens.length,
        currentScreenIndex: 0,
        nextComponentId: nextComponentIdRef.value,
    };
};

/**
 * Sets default property values for a component if they are missing after parsing.
 * @param {object} component - The component object to set defaults for.
 * @private
 */
const setDefaultProperties = (component) => {
    if (component.type === "PySideButton") {
        component.text = component.text ?? "Button";
        component.fontSize = component.fontSize ?? 16;
        component.textColor = component.textColor ?? "#ffffff";
        component.backgroundColor = component.backgroundColor ?? "#3b82f6";
        component.radius = component.radius ?? 4;
        component.pressedColor = component.pressedColor ?? "#1d4ed8";
        component.hoverColor = component.hoverColor ?? "#60a5fa";
        component.borderColor = component.borderColor ?? "#000000ff";
        component.borderWidth = component.borderWidth ?? 0;
        component.hoverBorderColor =
            component.hoverBorderColor ?? component.borderColor;
        component.pressedBorderColor =
            component.pressedBorderColor ?? component.borderColor;
    } else if (component.type === "PySideLabel") {
        component.text = component.text ?? "Label";
        component.fontSize = component.fontSize ?? 14;
        component.textColor = component.textColor ?? "#000000";
        component.backgroundColor = component.backgroundColor ?? "#f0f0f0";
        component.radius = component.radius ?? 0;
        component.borderColor = component.borderColor ?? "#cccccc";
        component.borderWidth = component.borderWidth ?? 1;
        component.textAlign = component.textAlign ?? "center";
    } else if (component.type === "PySideSlider") {
        component.minimum = component.minimum ?? 0;
        component.maximum = component.maximum ?? 100;
        component.value = component.value ?? 50;
        component.orientation = component.orientation ?? "horizontal";
        component.sliderColor = component.sliderColor ?? "#3b82f6";
        component.backgroundColor = component.backgroundColor ?? "#f0f0f0";
        component.trackColor = component.trackColor ?? "#c8c8c8";
        component.trackWidth = component.trackWidth ?? 8;
    } else if (component.type === "PySideFrame") {
        component.backgroundColor = component.backgroundColor ?? "#e0e0e0";
        component.frameShape = component.frameShape ?? "StyledPanel";
        component.frameShadow = component.frameShadow ?? "Sunken";
        component.lineWidth = component.lineWidth ?? 1;
        component.midLineWidth = component.midLineWidth ?? 0;
        component.borderColor = component.borderColor ?? "#808080";
        component.borderWidth = component.borderWidth ?? 1;
        component.useCustomBorder = component.useCustomBorder ?? false;
    }
};
