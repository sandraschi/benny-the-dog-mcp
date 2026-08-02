import { Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import ApiDocs from "./pages/ApiDocs";
import Cart from "./pages/Cart";
import Chat from "./pages/Chat";
import Dashboard from "./pages/Dashboard";
import Help from "./pages/Help";
import Jobs from "./pages/Jobs";
import Logs from "./pages/Logs";
import Members from "./pages/Members";
import Onboarding from "./pages/Onboarding";
import Settings from "./pages/Settings";
import Shop from "./pages/Shop";
import Skills from "./pages/Skills";
import Tools from "./pages/Tools";
import Vet from "./pages/Vet";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/vet" element={<Vet />} />
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
