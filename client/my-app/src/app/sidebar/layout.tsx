import type { Metadata } from "next";
import "../../styles/globals.css";
import Sidebar from "../components/SideBar";

export const metadata: Metadata = {
  title: "AODS",
  description: "Flat explorer & CCTV AI console",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="bg-[color:var(--color-bg,#ECF8FF)]">
        <div className="flex">
          <Sidebar />
          <main className="flex-1 min-h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
