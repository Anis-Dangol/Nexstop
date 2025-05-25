import { Outlet } from "react-router-dom";
import { MappingHeader } from "./header";

function MappingLayout() {
  return (
    <div className="flex flex-col bg-[#E6E0D3] overflow-hidden">
      {/* common header */}
      <MappingHeader />
      <main className="flex flex-col w-full">
        <Outlet />
      </main>
    </div>
  );
}

export default MappingLayout;
