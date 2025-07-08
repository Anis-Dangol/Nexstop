import { Outlet } from "react-router-dom";
import AdminSideBar from "./AdminSideBar";
import { useState } from "react";

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AdminSideBar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div
        className={`bg-[#e7e2da] flex flex-1 flex-col h-screen transition-all duration-300 ease-in-out ${
          collapsed ? "ml-20" : "ml-64"
        }`}
      >
        <main className="flex-1 p-4 md:p-2 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
