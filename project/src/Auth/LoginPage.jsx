import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext.jsx";
import { toast } from "react-toastify";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/users?email=${email}`);
      const data = await response.json();

      if (data.length && data[0].password === password) {
        const userData = {
          id: data[0].id,
          firstName: data[0].firstName,
          lastName: data[0].lastName,
          email: data[0].email,
          role: data[0].role || "user",
          cart: data[0].cart || [],
          wishlist: data[0].wishlist || [],
        };

        //  Store user in localStorage first
        localStorage.setItem("userLoggedIn", JSON.stringify(userData));
        //  Update context
        login(userData);

        //  Navigate based on role AFTER login
        if (userData.role.toLowerCase() === "admin") {
          navigate("/dashboard", { replace: true });
          // toast.success("admin login success")
        }if(userData.isActive===true){
          navigate(navigate("/", { replace: true }))
          // toast.success("user login success")
        }

      } else {
        toast.error("Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Error during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F0E1]">
      <form
        autoComplete="on"
        className="bg-[#D2B48C] p-8 rounded-lg w-96 text-[#7B4B3A] shadow-lg"
        onSubmit={handleLogin}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        <input
          type="email"
          placeholder="Email"
          autoComplete="email"
          className="w-full mb-4 p-2 rounded border border-[#B88A6F] bg-[#EDE4D3] text-[#7B4B3A] placeholder-[#7B4B3A]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          className="w-full mb-4 p-2 rounded border border-[#B88A6F] bg-[#EDE4D3] text-[#7B4B3A] placeholder-[#7B4B3A]"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 mb-4 bg-[#7B4B3A] text-[#F5F0E1] rounded hover:bg-[#5C362C] transition-colors ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm text-[#5C362C] text-center">
          Don't have an account?{" "}
          <span
            className="font-bold cursor-pointer hover:text-[#7B4B3A] transition-colors"
            onClick={() => navigate("/register")}
          >
            Register here
          </span>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
