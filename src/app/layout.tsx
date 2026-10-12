import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: { default: "MediaOps Studio", template: "%s · MediaOps Studio" }, description: "Turn one event image into a complete media release." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
