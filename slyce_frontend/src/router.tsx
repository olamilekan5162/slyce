import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import LandingPage from "./pages/landingPage/landingPage";
import Dashboard from "./pages/dashboard/Dashboard";
import Splits from "./pages/splits/Splits";
import SplitDetails from "./pages/splitDetatils/SplitDetails";
import Transactions from "./pages/transactions/Transactions";
import Profile from "./pages/profile/Profile";

const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  {
    path: "/app",
    element: <App />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "transactions", element: <Transactions /> },
      { path: "profile", element: <Profile /> },
      { path: "splits", element: <Splits /> },
      { path: "splits/:id", element: <SplitDetails /> },
    ],
  },
]);

export default router;
