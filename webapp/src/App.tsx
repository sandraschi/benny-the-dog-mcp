import { Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Dashboard from "./pages/Dashboard";
import Tools from "./pages/Tools";
import Skills from "./pages/Skills";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Logs from "./pages/Logs";
import ApiDocs from "./pages/ApiDocs";
import Jobs from "./pages/Jobs";
import Members from "./pages/Members";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Onboarding from "./pages/Onboarding";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/api-docs" element={<ApiDocs />} />
        <Route path="/members" element={<Members />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/help" element={<Help />} />
      </Route>
    </Routes>
  );
}