import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
    variable: "--font-montserrat",
    subsets: ["latin"],
});

export const metadata = {
    title: "UI Builder",
    description: "A simple UI builder for PySide6 used by the DPEA",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`${montserrat.variable} antialiased`}>
                {children}
            </body>
        </html>
    );
}
