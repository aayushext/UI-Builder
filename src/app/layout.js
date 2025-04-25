import PropTypes from "prop-types";
import "./globals.css";

export const metadata = {
    title: "UI Builder",
    description: "A simple UI builder for PySide6 used by the DPEA",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <title>{metadata.title}</title>
                <meta name="description" content={metadata.description} />
            </head>
            <body className={`antialiased`}>{children}</body>
        </html>
    );
}

RootLayout.propTypes = {
    children: PropTypes.node.isRequired,
};
