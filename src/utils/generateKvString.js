// utils/generateKvString.js

export const generateKvString = (
  components,
  backgroundColor,
  centerPanelDimensions
) => {
  let kvString = `
<MyScreen>:
    canvas.before:
        Color:
            rgba: ${hexToRgba(backgroundColor)}
        Rectangle:
            pos: self.pos
            size: self.size
    FloatLayout:
`;

  components.forEach((component, index) => {
    const relativeX = component.x / centerPanelDimensions.width;

    const relativeY =
      (centerPanelDimensions.height - component.y - component.height) /
      centerPanelDimensions.height;
    const relativeWidth = component.width / centerPanelDimensions.width;
    const relativeHeight = component.height / centerPanelDimensions.height;

    if (component.type === "KivyButton") {
      kvString += `
        Button:
            text: "${component.text}"
            size_hint: ${relativeWidth.toFixed(4)}, ${relativeHeight.toFixed(4)}
            pos_hint: {'x': ${relativeX.toFixed(4)}, 'y': ${relativeY.toFixed(
        4
      )}}
            font_size: ${component.fontSize}
            color: ${hexToRgba(component.textColor)}
            background_color: 0, 0, 0, 0
            background_normal: ''
            background_down: ''
            canvas.before:
                Color:
                    rgba: (${hexToRgba(
                      component.pressedColor
                    )}) if self.state == 'down' else (${hexToRgba(
        component.backgroundColor
      )})
                RoundedRectangle:
                    pos: self.pos
                    size: self.size
                    radius: [${component.radius}]
`;
    } else if (component.type === "KivyLabel") {
      kvString += `
        Label:
            text: "${component.text}"
            size_hint: ${relativeWidth.toFixed(4)}, ${relativeHeight.toFixed(4)}
            pos_hint: {'x': ${relativeX.toFixed(4)}, 'y': ${relativeY.toFixed(
        4
      )}}
            font_size: ${component.fontSize}
            color: ${hexToRgba(component.textColor)}
            background_color: 0, 0, 0, 0
            background_normal: ''
            canvas.before:
                Color:
                    rgba: ${hexToRgba(component.backgroundColor)}
                RoundedRectangle:
                    pos: self.pos
                    size: self.size
                    radius: [${component.radius}]
`;
    }
  });

  kvString += `
`;
  return kvString;
};

const hexToRgba = (hex) => {
  hex = hex.replace("#", "");
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  return `${r / 255}, ${g / 255}, ${b / 255}, 1`;
};
