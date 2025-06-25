import { Outlet } from "react-router-dom";
import AdminSideBar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { useState } from "react";

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      <AdminSideBar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="bg-[#e7e2da] flex flex-1 flex-col">
        <AdminHeader />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}


export default AdminLayout;
