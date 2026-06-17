import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { DAppKitProvider } from "@mysten/dapp-kit-react";
import router from "./router.tsx";
import { dAppKit } from "./lib/suiClient.ts";
import "./index.css";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DAppKitProvider dAppKit={dAppKit}>
      <RouterProvider router={router} />
      <Toaster position="top-center" />
    </DAppKitProvider>
  </StrictMode>,
);
