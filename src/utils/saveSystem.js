import { generateQtUiFile } from "@/utils/generatePySideCode";

// Function to parse a hex color from rgba format (returns #RRGGBB or #RRGGBBAA)
const parseRgba = (rgbaStr) => {
    // Match rgba format (r, g, b, a)
    const match = rgbaStr.match(
        /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/
    );
    if (!match) return "#000000";

    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    const a = match[4] ? parseFloat(match[4]) : 1;

    const rHex = r.toString(16).padStart(2, "0");
    const gHex = g.toString(16).padStart(2, "0");
    const bHex = b.toString(16).padStart(2, "0");
    const aHex =
        a < 1
            ? Math.round(a * 255)
                  .toString(16)
                  .padStart(2, "0")
            : "";

    return `#${rHex}${gHex}${bHex}${aHex}`;
};

export const exportToUiFile = (screens, currentScreenIndex) => {
    const uiFile = generateQtUiFile(screens, currentScreenIndex);
    const blob = new Blob([uiFile], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ui-design.ui";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const importFromUiFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(
                    event.target.result,
                    "text/xml"
                );

                const appState = parseUiFile(xmlDoc);
                resolve(appState);
            } catch (error) {
                reject(new Error(`Failed to parse UI file: ${error.message}`));
            }
        };

        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsText(file);
    });
};

const parseUiFile = (xmlDoc) => {
    const screens = [];
    let nextComponentId = 0;

    const mainWindow = xmlDoc.querySelector("widget[class='QMainWindow']");
    const mainGeometry = mainWindow.querySelector(
        "property[name='geometry'] rect"
    );

    const defaultWidth = parseInt(
        mainGeometry.querySelector("width").textContent
    );
    const defaultHeight = parseInt(
        mainGeometry.querySelector("height").textContent
    );

    const stackedWidget = mainWindow.querySelector(
        "widget[class='QStackedWidget']"
    );
    const screenWidgets = stackedWidget.querySelectorAll(
        "widget[class='QWidget']"
    );

    screenWidgets.forEach((screenWidget, screenIndex) => {
        const screenName = screenWidget
            .getAttribute("name")
            .replace("screen_", "");
        const screenNum = parseInt(screenName) + 1;

        const styleSheet = screenWidget.querySelector(
            "property[name='styleSheet'] string"
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
            customId:
                screenWidget.getAttribute("name") || `screen_${screenIndex}`,
            components: [],
            backgroundColor,
            width: defaultWidth,
            height: defaultHeight,
        };

        const componentWidgets = screenWidget.querySelectorAll("widget");
        componentWidgets.forEach((componentWidget) => {
            const componentType = componentWidget.getAttribute("class");
            const componentId = componentWidget.getAttribute("name");

            if (!["QPushButton", "QLabel", "QSlider"].includes(componentType)) {
                return;
            }

            const typeMap = {
                QPushButton: "PySideButton",
                QLabel: "PySideLabel",
                QSlider: "PySideSlider",
            };

            const geometry = componentWidget.querySelector(
                "property[name='geometry'] rect"
            );
            const x = parseInt(geometry.querySelector("x").textContent);
            const y = parseInt(geometry.querySelector("y").textContent);
            const width = parseInt(geometry.querySelector("width").textContent);
            const height = parseInt(
                geometry.querySelector("height").textContent
            );

            let text = "";
            const textProp = componentWidget.querySelector(
                "property[name='text'] string"
            );
            if (textProp) {
                text = textProp.textContent;
            }

            const componentStyle = componentWidget.querySelector(
                "property[name='styleSheet'] string"
            );
            const component = {
                id: nextComponentId++,
                type: typeMap[componentType],
                componentId,
                x,
                y,
                width,
                height,
            };

            if (
                component.type === "PySideButton" ||
                component.type === "PySideLabel"
            ) {
                component.text = text;

                if (componentStyle) {
                    const content = componentStyle.textContent;

                    const fontSizeMatch = content.match(/font-size:\s*(\d+)px/);
                    if (fontSizeMatch)
                        component.fontSize = parseInt(fontSizeMatch[1]);

                    const textColorMatch = content.match(
                        /color:\s*rgba\(([^)]+)\)/
                    );
                    if (textColorMatch)
                        component.textColor = parseRgba(
                            `rgba(${textColorMatch[1]})`
                        );

                    const bgColorMatch = content.match(
                        /background-color:\s*rgba\(([^)]+)\)/
                    );
                    if (bgColorMatch)
                        component.backgroundColor = parseRgba(
                            `rgba(${bgColorMatch[1]})`
                        );

                    const radiusMatch = content.match(
                        /border-radius:\s*(\d+)px/
                    );
                    if (radiusMatch)
                        component.radius = parseInt(radiusMatch[1]);

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
                    }

                    if (component.type === "PySideLabel") {
                        const borderColorMatch = content.match(
                            /border:\s*1px solid rgba\(([^)]+)\)/
                        );
                        if (borderColorMatch)
                            component.borderColor = parseRgba(
                                `rgba(${borderColorMatch[1]})`
                            );
                    }
                }
            } else if (component.type === "PySideSlider") {
                const minProp = componentWidget.querySelector(
                    "property[name='minimum'] number"
                );
                if (minProp) component.minimum = parseInt(minProp.textContent);

                const maxProp = componentWidget.querySelector(
                    "property[name='maximum'] number"
                );
                if (maxProp) component.maximum = parseInt(maxProp.textContent);

                const valueProp = componentWidget.querySelector(
                    "property[name='value'] number"
                );
                if (valueProp)
                    component.value = parseInt(valueProp.textContent);

                const orientationProp = componentWidget.querySelector(
                    "property[name='orientation'] enum"
                );
                if (orientationProp) {
                    component.orientation =
                        orientationProp.textContent.includes("Vertical")
                            ? "vertical"
                            : "horizontal";
                }

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
                }
            }

            setDefaultProperties(component);
            screen.components.push(component);
        });

        screens.push(screen);
    });

    return {
        screens,
        nextScreenId: screens.length,
        currentScreenIndex: 0,
        nextComponentId,
    };
};

const setDefaultProperties = (component) => {
    if (component.type === "PySideButton") {
        component.fontSize = component.fontSize || 16;
        component.textColor = component.textColor || "#ffffff";
        component.backgroundColor = component.backgroundColor || "#3b82f6";
        component.radius = component.radius || 4;
        component.pressedColor = component.pressedColor || "#1d4ed8";
        component.hoverColor = component.hoverColor || "#60a5fa";
    } else if (component.type === "PySideLabel") {
        component.fontSize = component.fontSize || 14;
        component.textColor = component.textColor || "#000000";
        component.backgroundColor = component.backgroundColor || "#f0f0f0";
        component.radius = component.radius || 0;
        component.borderColor = component.borderColor || "#cccccc";
    } else if (component.type === "PySideSlider") {
        component.minimum = component.minimum || 0;
        component.maximum = component.maximum || 100;
        component.value = component.value || 50;
        component.orientation = component.orientation || "horizontal";
        component.sliderColor = component.sliderColor || "#3b82f6";
        component.backgroundColor = component.backgroundColor || "#f0f0f0";
    }
};
