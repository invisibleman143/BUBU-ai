import "./globals.css";
import { AuthProvider } from "../lib/context/AuthContext";


export const metadata = {
  title: "BUBU – AI Voice Assistant",
  description: "Modern AI Voice Assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
   <html lang="en" className="h-full">
  <head>
    <link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#020617" />

    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
    />
  </head>

<body className="h-full bg-[#0B0F1A] text-white overscroll-none">

    <div className="h-full w-full">
      <AuthProvider>{children}</AuthProvider>
    </div>
  </body>
</html>

  );
}
    