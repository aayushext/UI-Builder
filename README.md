This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Adding New PySide Widget Previews

This application uses a data-driven system to manage PySide widget previews and their export to Qt Designer's `.ui` XML format. To add a new widget type, follow these steps:

1.  **Create the React Component:**
    *   Develop a new React component in the `src/components/pyside-components/` directory (e.g., `MyNewWidget.js`).
    *   This component will serve as the visual preview of your PySide widget within the application.
    *   It should accept props corresponding to the widget's properties (e.g., `text`, `checked`, `fontSize`, `backgroundColor`).
    *   Style it to resemble the native PySide widget as closely as possible.

2.  **Define the Widget in `src/utils/componentDefinitions.json`:**
    *   Open `src/utils/componentDefinitions.json` and add a new JSON object to the `components` array for your new widget.
    *   This definition includes:
        *   `type`: A unique string identifier (e.g., "MyNewWidget").
        *   `displayName`: User-friendly name for the UI (e.g., "My New Widget").
        *   `jsComponent`: The filename (without extension) of your React component (e.g., "MyNewWidget").
        *   `defaultProps`: An object defining default values for all properties of the new widget.
        *   `properties`: An array defining which properties are editable in the UI, their types, and labels.
        *   `qtXml`: A crucial object that defines how this widget translates to Qt `.ui` XML.
    *   **Detailed `qtXml` Structure**: Refer to the extensive documentation comment (under the `_readme` key) at the top of `src/utils/componentDefinitions.json` for a full breakdown of all `qtXml` fields and their purpose (e.g., `class`, `nameProperty`, `directProperties`, `propertiesMap`, `styleSheet` and its sub-properties like `selector`, `properties`, `conditionalProperties`, `states`, `subControls`).

3.  **Map the React Component in `src/utils/componentLoader.js`:**
    *   Open `src/utils/componentLoader.js`.
    *   Import your new React component:
        ```javascript
        import MyNewWidget from '../components/pyside-components/MyNewWidget';
        ```
    *   Add an entry to the `componentMap` object, mapping the `jsComponent` string (from step 2) to the imported component:
        ```javascript
        const componentMap = {
          // ... other components
          "MyNewWidget": MyNewWidget,
        };
        ```

Once these steps are completed, the new widget should be available in the component palette, its properties editable in the right-side panel, and it should be correctly exported to the `.ui` file. The system relies on the `qtXml` definition for generating the appropriate XML structure and stylesheets.
