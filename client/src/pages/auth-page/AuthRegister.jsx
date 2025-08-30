import CommonForm from "@/components/auth/CommonForm";
import { useToast } from "@/components/ui/use-toast";
import { registerFormControls } from "@/services";
import { registerUser } from "@/map/auth-slice/AuthSlice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";

const initialState = {
  userName: "",
  email: "",
  password: "",
};

function AuthRegister() {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  function onSubmit(event) {
    event.preventDefault();
    dispatch(registerUser(formData)).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: data?.payload?.message,
        });
        navigate("/auth/login");
      } else {
        toast({
          title: data?.payload?.message,
          variant: "destructive",
        });
      }
    });
  }

  console.log(formData);

  return (
    <div className="mx-auto w-full max-w-md bg-white shadow-2xl rounded-2xl p-10 space-y-8 border border-gray-100">
      <div className="flex flex-col items-center space-y-2">
            {/* Navbar-like logo inside card */}
          <div className="w-full border-b border-[#070f18] pb-4 mb-4 flex items-center justify-center">
            <span className="bg-[#070f18] p-2 rounded-full mr-2"><MapPin size={30} color="#E6E0D3" /></span>
            <h1 className="font-bold text-[#070f18] text-2xl">Nexstop</h1>
          </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Create A New Account
        </h1>
        <p className="text-muted-foreground text-sm">Please fill in the details below.</p>
      </div>
      <CommonForm
        formControls={registerFormControls}
        buttonText={"Sign Up"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />
      <p className="mt-0 text-center text-sm text-foreground">
        Already have an account?
        <Link
          className="font-medium ml-2 text-primary hover:underline"
          to="/auth/login"
        >
          Login
        </Link>
      </p>
    </div>
  );
}

export default AuthRegister;