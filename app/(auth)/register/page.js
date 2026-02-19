"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Aurora from "@/components/common/Aurora";
import Navbar from "@/components/common/Navbar";
import { validateRegister } from "@/utils/validateRegister";

const styles = {
  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "8px",
  },
};

function InputField({ label, type, name, value, onChange, disabled, placeholder, error }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <label style={styles.label} htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/40 transition"
        style={{
          border: error ? "1px solid #ef4444" : undefined
        }}
        placeholder={placeholder}
      />
      {error && (
        <p style={{ color: "#f87171", fontSize: "12px", marginTop: "6px" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "participant",
  });

  const [status, setStatus] = useState({
    error: "",
    success: "",
    loading: false,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateRegister(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setStatus({ error: "", success: "", loading: true });

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setStatus({
        error: "",
        success: "Registration successful! Redirecting to login...",
        loading: false,
      });

      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      setStatus({
        error: err.message || "Something went wrong.",
        success: "",
        loading: false,
      });
    }
  };

  return (
    <main className="bg-space-900 relative min-h-screen">
      <Navbar />

      <div className="fixed inset-0 z-0 pointer-events-none">
        <Aurora
          colorStops={["#00ff87", "#60a5fa", "#00ff87"]}
          amplitude={1}
          blend={0.6}
          speed={0.8}
        />
      </div>

      <section className="relative z-10 flex justify-center py-32 px-4">
        <div className="glass-card border-glow w-full max-w-md rounded-2xl p-10 backdrop-blur-xl">

          <div className="relative mb-8">
            <button
              onClick={() => router.push("/")}
              className="absolute -top-2 -left-2 p-2 rounded-lg text-slate-400 hover:text-neon-cyan hover:bg-white/5 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                Create Account
              </h2>
              <p className="text-slate-400 text-sm font-mono">
                Join EventFlow and start organizing
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <InputField
              label="Full Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={status.loading}
              placeholder="Enter your name"
              error={errors.name}
            />

            <InputField
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={status.loading}
              placeholder="Enter your email"
              error={errors.email}
            />

            <InputField
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={status.loading}
              placeholder="Create a password"
              error={errors.password}
            />

            <div style={{ marginBottom: "24px" }}>
              <label style={styles.label}>I am a</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={status.loading}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/40 transition"
              >
                <option value="participant">Participant</option>
                <option value="mentor">Mentor</option>
                <option value="judge">Judge</option>
              </select>
            </div>

            {status.error && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center mb-4">
                {status.error}
              </div>
            )}

            {status.success && (
              <div className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center mb-4">
                {status.success}
              </div>
            )}

            <button
              type="submit"
              disabled={status.loading}
              className="btn-neon w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold tracking-wide text-sm"
            >
              {status.loading ? "Creating Account..." : "Sign Up"}
              {!status.loading && <ArrowRight className="w-4 h-4" />}
            </button>

            <div className="mt-6 text-center text-sm text-slate-500 font-mono">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-neon-cyan hover:text-white transition"
              >
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
