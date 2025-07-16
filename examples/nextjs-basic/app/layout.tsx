import type { Metadata } from "next";

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
      <body>{children}</body>
    </html>
  );
}
