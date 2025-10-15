import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext.jsx";
import { toast } from 'react-toastify';

function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long!");
      return;
    }

    setIsLoading(true);

    try {
      // Check if user already exists
      const checkResponse = await fetch(`http://localhost:5000/users?email=${email}`);
      const existingUsers = await checkResponse.json();

      if (existingUsers.length > 0) {
        toast.error("This email is already registered. Please login.");
        return;
      }

      // Register new user with complete structure
      const newUser = {
        id: Math.random().toString(36).substr(2, 9), // Generate unique ID
        firstName,
        lastName,
        email,
        password,
        role: "user",
        isAuthenticated: true,
        cart: [],
        wishlist: [],
        shippingAddress: [],
        orders: []
      };

      const response = await fetch("http://localhost:5000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) throw new Error("Failed to register user");

      await response.json();
      
      // Create user data for login (without password)
      const userData = {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
        cart: newUser.cart,
        wishlist: newUser.wishlist
      };
      
      // Store in localStorage
      localStorage.setItem("userLoggedIn", JSON.stringify(userData));
      
      login(userData);
      toast.success("Registration successful!");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Error registering user. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F0E1]">
      <form
        autoComplete="off"
        className="bg-[#D2B48C] p-8 rounded-lg w-96 text-[#7B4B3A] shadow-lg"
        onSubmit={handleRegister}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

        <div className="flex gap-4 mb-4">
          <input
            autoComplete="given-name"
            placeholder="First Name"
            className="w-1/2 p-2 rounded border border-[#B88A6F] bg-[#EDE4D3] text-[#7B4B3A] placeholder-[#7B4B3A]"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            autoComplete="family-name"
            placeholder="Last Name"
            className="w-1/2 p-2 rounded border border-[#B88A6F] bg-[#EDE4D3] text-[#7B4B3A] placeholder-[#7B4B3A]"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <input
          autoComplete="email"
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-2 rounded border border-[#B88A6F] bg-[#EDE4D3] text-[#7B4B3A] placeholder-[#7B4B3A]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          autoComplete="new-password"
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-2 rounded border border-[#B88A6F] bg-[#EDE4D3] text-[#7B4B3A] placeholder-[#7B4B3A]"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          autoComplete="new-password"
          type="password"
          placeholder="Confirm Password"
          className="w-full mb-4 p-2 rounded border border-[#B88A6F] bg-[#EDE4D3] text-[#7B4B3A] placeholder-[#7B4B3A]"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 mb-4 bg-[#7B4B3A] text-[#F5F0E1] rounded hover:bg-[#5C362C] transition-colors ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Registering..." : "Register"}
        </button>

        <p className="text-sm text-[#5C362C] text-center">
          Already have an account?{" "}
          <span
            className="font-bold cursor-pointer hover:text-[#7B4B3A] transition-colors"
            onClick={() => navigate("/login")}
          >
            Login here
          </span>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;