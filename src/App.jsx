import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import MythosJournal from "./journal/MythosJournal.jsx";
import NoteIndex from "./note/NoteIndex.jsx";
import NotePage from "./note/NotePage.jsx";

const navStyle = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  padding: "10px 20px",
  fontSize: 14,
  color: "#888",
  textDecoration: "none",
  borderBottom: "2px solid transparent",
  transition: "all 0.2s",
};

const activeStyle = {
  ...navStyle,
  color: "#333",
  borderBottomColor: "#333",
  fontWeight: 500,
};

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => (isActive ? activeStyle : navStyle)}
    >
      {children}
    </NavLink>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{
        fontFamily: "'LINE Seed JP', 'Noto Sans JP', -apple-system, BlinkMacSystemFont, sans-serif",
        minHeight: "100vh",
        background: "#fff",
      }}>
        <nav style={{
          display: "flex",
          borderBottom: "1px solid #f0f0f0",
          background: "#fff",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}>
          <NavItem to="/journal">Journal</NavItem>
          <NavItem to="/note">Note</NavItem>
        </nav>

        <Routes>
          <Route path="/" element={<Navigate to="/journal" replace />} />
          <Route path="/journal" element={<MythosJournal />} />
          <Route path="/note" element={<NoteIndex />} />
          <Route path="/note/:categoryId" element={<NoteIndex />} />
          <Route path="/note/:categoryId/:pageId" element={<NotePage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
