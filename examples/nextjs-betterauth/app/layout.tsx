import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";

export const metadata: Metadata = {
  title: "Dodo Payments NextJS Adapter Example",
  description: "Example implementation of @dodopayments/nextjs adapter",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f8f9fa;
            }
            
            main {
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              min-height: calc(100vh - 4rem);
            }
            
            h1 {
              color: #1a1a1a;
              margin-bottom: 1rem;
              padding-bottom: 0.5rem;
              border-bottom: 2px solid #e9ecef;
            }
            
            h2 {
              color: #495057;
              margin-top: 2rem;
              margin-bottom: 1rem;
            }
            
            h3 {
              color: #6c757d;
              margin-bottom: 0.5rem;
            }
            
            code {
              background-color: #f8f9fa;
              padding: 0.2rem 0.4rem;
              border-radius: 3px;
              font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
              font-size: 0.9em;
              color: #e83e8c;
            }
            
            ul {
              margin-left: 1.5rem;
              margin-bottom: 1rem;
            }
            
            li {
              margin-bottom: 0.5rem;
            }
            
            p {
              margin-bottom: 1rem;
            }
            
            a {
              color: #007bff;
              text-decoration: none;
            }
            
            a:hover {
              text-decoration: underline;
            }
            
            .highlight {
              background-color: #fff3cd;
              padding: 1rem;
              border-left: 4px solid #ffc107;
              margin: 1rem 0;
              border-radius: 4px;
            }
          `,
          }}
        />
      </head>
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
