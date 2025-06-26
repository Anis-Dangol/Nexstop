import { AlignJustify, LogOut, UserCog, MapPin } from "lucide-react"; // Added MapPin
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { logoutUser } from "@/map/auth-slice/AuthSlice";

function HeaderRightContent() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleLogout() {
    dispatch(logoutUser());
  }

  return (
    <div className="flex lg:items-center lg:flex-row flex-col gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="bg-black cursor-pointer">
            {" "}
            {/* Added cursor-pointer */}
            <AvatarFallback className="bg-[#E6E0D3] text-[#070f18] font-extrabold">
              {user?.userName[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="right"
          className="w-56 mt-2 border-[#070f18] bg-[#E6E0D3]"
        >
          <DropdownMenuLabel>Logged in as {user?.userName}</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-[#070f18]" />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function MappingHeader({ setOpen }) {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  console.log(user, "useruseruser");

  return (
    <header className="bg-[#070f18] sticky top-0 z-40 w-full border-b border-[#070f18] pt-3 shadow-lg"> {/* Added shadow */}
      <div className="flex h-1/6 text-xl items-center justify-between px-4 sm:px-6 pt-5">
        <Button onClick={() => setOpen(true)} className="sm:block">
          <AlignJustify />
          <span className="sr-only">Toggle Menu</span>
        </Button>
        <Link to="/map/home" className="flex items-center gap-2">
          <MapPin size={30} color="#E6E0D3" /> {/* Updated icon color */}
          <h1 className="font-bold text-[#E6E0D3] text-2xl">Nexstop</h1> {/* Updated design */}
        </Link>

        {/* Desktop */}
        <div className="hidden sm:block">
          <HeaderRightContent />
        </div>
        {/* Mobile */}
        <div className="block sm:hidden">
          <HeaderRightContent />
        </div>
      </div>
    </header>
  );
}
