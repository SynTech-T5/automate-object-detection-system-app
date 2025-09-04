import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "../styles/globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100","200","300","400","500","600","700","800","900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Automate Object Detection System",
  description: "AI Camera Monitoring Platform",
  icons: {
    icon: "/automate-object-detection-system.ico",
  },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // <html lang="th" className={`${poppins.variable}`}>
    //   <body className="bg-[color:var(--color-bg,#ECF8FF)] font-sans">
    //   <main>{children}</main>
    //   </body>
    // </html>
    <html lang="th">
      <body className="bg-[color:var(--color-bg,#ECF8FF)]">
      <main>{children}</main>
      </body>
    </html>
  );
}