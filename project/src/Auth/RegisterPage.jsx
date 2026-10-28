import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext.jsx";
import { toast } from 'react-toastify';
import api from "../api/api";

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
      const newUser = { firstName, lastName, email, password };
      const response = await api.post("/auth/register", newUser);

      toast.success("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error registering user. Try again.");
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

