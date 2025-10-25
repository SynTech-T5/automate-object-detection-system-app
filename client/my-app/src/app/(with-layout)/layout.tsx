import "../../styles/globals.css";
import Sidebar from "../components/Layouts/SideBar";
import Header from "../components/Layouts/Header";
import { UIProvider } from "../components/Layouts/UI-Provider";
import Title from "../components/Layouts/Title";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="bg-[color:var(--color-bg,#ECF8FF)]">
        <UIProvider>
          {/* อยู่บนสุดเต็มความกว้าง */}
          <Header userName="Admin" />

          {/* แถว: ซ้าย Sidebar, ขวา Main */}
          <div className="flex min-h-[calc(100vh-3.5rem)] md:min-h-[calc(100vh-4rem)]">
            <Sidebar />
            <main className="flex-1 min-w-0 p-4 md:p-6 space-y-6">
              <Title />
                {children}
            </main>
          </div>
        </UIProvider>
      </body>
    </html>
  );
}