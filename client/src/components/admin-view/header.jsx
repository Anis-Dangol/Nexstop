import { LogOut, MapPin } from "lucide-react";

function AdminHeader() {
  return (
    <header className="bg-[#070f18] sticky top-0 z-40 w-full border-b border-[#070f18] shadow-lg">
      <div className="flex items-center justify-center px-4 sm:px-6 py-4">
        {/* Centered Admin Title */}
        <div className="flex items-center gap-2">
          <MapPin size={30} color="#E6E0D3" />
          <h1 className="font-bold text-[#E6E0D3] text-2xl">Nexstop</h1>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
