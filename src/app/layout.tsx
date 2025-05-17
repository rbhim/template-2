import "./globals.css";
import { Inter } from "next/font/google";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Project Management Portal",
  description: "Track and manage traffic engineering consulting projects",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-white text-gray-900`}>
        {children}
        
        {/* Script to suppress Grammarly extension warnings */}
        <Script id="suppress-grammarly" strategy="afterInteractive">
          {`
            // Remove Grammarly attributes to prevent React hydration warnings
            if (typeof window !== 'undefined') {
              const observer = new MutationObserver(() => {
                const body = document.querySelector('body');
                if (body && body.hasAttribute('data-gr-ext-installed')) {
                  body.removeAttribute('data-gr-ext-installed');
                }
                if (body && body.hasAttribute('data-new-gr-c-s-check-loaded')) {
                  body.removeAttribute('data-new-gr-c-s-check-loaded');
                }
              });
              observer.observe(document.documentElement, { 
                attributes: true, 
                childList: true, 
                subtree: true 
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
