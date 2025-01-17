import { Inter } from "next/font/google";
import "./globals.css";
import Warnings from "./components/warnings";
import { assistantId } from "./assistant-config";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SmartUp Graph Assistant",
  description: "A graph visualization assistant powered by OpenAI",
  icons: {
    icon: "/smartup.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {assistantId ? children : <Warnings />}
        <img className="logo" src="/smartup.svg" alt="SmartUp Logo" />
      </body>
    </html>
  );
}
