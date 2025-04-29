/**
 * Convert hex color to RGB object.
 * @param {string} hex
 * @returns {{r: number, g: number, b: number}|null}
 */
export const hexToRgb = (hex) => {
    if (!hex) return null;
    hex = hex.replace("#", "");
    let r, g, b;
    if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length >= 6) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    } else {
        return null;
    }
    return { r, g, b };
};

/**
 * Convert RGB object to hex color string.
 * @param {{r: number, g: number, b: number}} rgb
 * @returns {string}
 */
export const rgbToHex = ({ r, g, b }) =>
    "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");

/**
 * Convert hex color to rgba string fragment (e.g., "255, 0, 0, 1").
 * Supports #RGB, #RRGGBB, #RRGGBBAA.
 * @param {string} hex
 * @returns {string}
 */
export const hexToRgba = (hex) => {
    if (!hex) return "0, 0, 0, 1";
    hex = hex.replace("#", "");
    let r,
        g,
        b,
        a = 1;
    if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    } else if (hex.length === 8) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
        a = parseInt(hex.substring(6, 8), 16) / 255;
    } else {
        return "0, 0, 0, 1";
    }
    return `${r}, ${g}, ${b}, ${a}`;
};

/**
 * Convert rgba() or rgb() string to hex color string (#RRGGBB or #RRGGBBAA).
 * @param {string} rgbaStr
 * @returns {string}
 */
export const rgbaToHex = (rgbaStr) => {
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

/**
 * Adjust color brightness by a percentage.
 * @param {string} hex
 * @param {number} percent
 * @returns {string}
 */
export const adjustColor = (hex, percent) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    const factor = 1 + percent / 100;
    return rgbToHex({
        r: Math.max(0, Math.min(255, rgb.r * factor)),
        g: Math.max(0, Math.min(255, rgb.g * factor)),
        b: Math.max(0, Math.min(255, rgb.b * factor)),
    });
};
