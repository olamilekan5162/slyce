import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import LandingPage from "./pages/landingPage/landingPage";
import Dashboard from "./pages/dashboard/Dashboard";
import Splits from "./pages/splits/Splits";
import SplitDetails from "./pages/splitDetatils/SplitDetails";
import Transactions from "./pages/transactions/Transactions";
import Profile from "./pages/profile/Profile";
import AddSplit from "./pages/addSplit/AddSplit";
import ConfirmSplit from "./pages/confirmSplit/ConfirmSplit";

const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/confirm/:id", element: <ConfirmSplit /> },
  {
    path: "/app",
    element: <App />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "transactions", element: <Transactions /> },
      { path: "profile", element: <Profile /> },
      { path: "splits", element: <Splits /> },
      { path: "splits/new", element: <AddSplit /> },
      { path: "splits/:id/edit", element: <AddSplit /> },
      { path: "splits/:id", element: <SplitDetails /> },
    ],
  },
]);

export default router;
