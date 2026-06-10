import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import RegisterTicket from "./pages/RegisterTicket";
import ChatTicket from "./pages/ChatTicket";
import AdminDashboard from "./pages/AdminDashboard";

function App() {

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  return (
    <BrowserRouter>

      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/crear"
          element={
            user && user.role === "USER"
              ? <RegisterTicket />
              : <Login />
          }
        />

        <Route
          path="/admin"
          element={
            user && user.role === "ADMIN"
              ? <AdminDashboard />
              : <Login />
          }
        />

        <Route
          path="/chat/:id"
          element={
            user ? <ChatTicket /> : <Login />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
