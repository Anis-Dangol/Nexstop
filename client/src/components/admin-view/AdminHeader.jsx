import { useState } from "react";
import { LogOut, AlignJustify, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button"; // Adjust this import if needed

function AdminHeader() {
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    // Add logout logic here
    console.log("Logging out...");
  };

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-[#E6E0D3] border-b">
      <Button onClick={() => setOpen(true)} className="lg:hidden sm:block">
        <AlignJustify />
        <span className="sr-only">Toggle Menu</span>
      </Button>
      <div className="flex flex-1 justify-end">
        <Button
          onClick={handleLogout}
          className="inline-flex gap-2 items-center rounded-md px-4 py-2 text-sm font-medium shadow"
        >
          <LogOut />
          Logout
        </Button>
      </div>
    </header>
  );
}

export default AdminHeader;
