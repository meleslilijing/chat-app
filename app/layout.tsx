import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        style={{ background: 'red' }}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <div className="test-haha"></div>
            {children}
          </ThemeProvider>
      </body>
    </html>
  );
}
