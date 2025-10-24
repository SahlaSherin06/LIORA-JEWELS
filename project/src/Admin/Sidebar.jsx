
import React, { useState, useEffect, useContext } from "react";
import { FaBars, FaHome, FaBoxOpen, FaUsers, FaHistory, FaSignOutAlt,} from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const [isMobile, setIsMobile] = useState(false);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const menu = [
    { name: "Dashboard", icon: <FaHome />, path: "/dashboard" },
    { name: "Products", icon: <FaBoxOpen />, path: "/products" },
    { name: "Orders", icon: <FaHistory />, path: "/orders" },
    { name: "Users", icon: <FaUsers />, path: "/users" },
  ];

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(true); // always open on desktop
      if (mobile) setIsOpen(false); // collapsed on mobile
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsOpen]);

  const handleLogout = () => {
    logout?.();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Toggle */}
      {isMobile && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 bg-[#7B4B3A] text-white p-2 rounded-md shadow-md focus:outline-none"
        >
          <FaBars size={20} />
        </button>
      )}

      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-[#7B4B3A] text-[#F5F0E1] shadow-lg flex flex-col z-50 transition-all duration-300
          ${isMobile ? (isOpen ? "w-64" : "-translate-x-full") : "w-64"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-center px-4 py-4 border-b border-[#5C362C]">
          <h1 className="text-xl font-bold">Admin</h1>
        </div>

        {/* Menu */}
        <nav className="flex-1 mt-4 overflow-y-auto">
          {menu.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 m-2 rounded-md hover:bg-[#5C362C] transition ${
                  isActive ? "bg-[#5C362C]" : ""
                }`
              }
              onClick={() => isMobile && setIsOpen(false)}
            >
              <span className="text-lg w-6 flex justify-center">{item.icon}</span>
              <span className="text-base">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 border-t border-[#5C362C] hover:bg-[#5C362C] transition"
        >
          <FaSignOutAlt className="text-lg" />
          <span>Logout</span>
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
