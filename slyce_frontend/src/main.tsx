import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { DAppKitProvider } from "@mysten/dapp-kit-react";
import router from "./router.tsx";
import { dAppKit } from "./lib/suiClient.ts";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DAppKitProvider dAppKit={dAppKit}>
      <RouterProvider router={router} />
    </DAppKitProvider>
  </StrictMode>,
);
