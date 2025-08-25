import CommonForm from "@/components/auth/CommonForm";
import { useToast } from "@/components/ui/use-toast";
import { loginFormControls } from "@/services";
import { loginUser } from "@/map/auth-slice/AuthSlice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { MapPin } from "phosphor-react";

const initialState = {
  email: "",
  password: "",
};

function AuthLogin() {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  function onSubmit(event) {
    event.preventDefault();
    setLoading(true);
    dispatch(loginUser(formData)).then((data) => {
      setLoading(false);
      if (data?.payload?.success) {
        toast({
          title: data?.payload?.message,
        });
      } else {
        toast({
          title: data?.payload?.message,
          variant: "destructive",
        });
      }
    });
  }

  return (
      
        <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-10 space-y-8 border border-gray-100">
          <div className="flex flex-col items-center space-y-2">
            {/* Navbar-like logo inside card */}
          <div className="w-full border-b border-[#070f18] pb-4 mb-4 flex items-center justify-center">
            <span className="bg-[#070f18] p-2 rounded-full mr-2"><MapPin size={30} color="#E6E0D3" /></span>
            <h1 className="font-bold text-[#070f18] text-2xl">Nexstop</h1>
          </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Sign In</h1>
            <p className="text-muted-foreground text-sm">Welcome back! Please login to your account.</p>
          </div>
          <CommonForm
            formControls={loginFormControls}
            buttonText={"Sign In"}
            formData={formData}
            setFormData={setFormData}
            onSubmit={onSubmit}
          />
          <p className="text-center text-sm text-foreground mt-4">
            Don't have an account?{' '}
            <Link className="font-medium text-primary hover:underline" to="/auth/register">
              Register
            </Link>
          </p>
        </div>
      
  );
}


export default AuthLogin;
