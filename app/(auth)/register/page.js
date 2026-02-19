"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { validateRegister } from "@/utils/validateRegister";




const [errors, setErrors] = useState({});
const [status, setStatus] = useState({
  error: "",
  success: "",
  loading: false,
});

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "24px",
    backgroundImage: "url(/auth-bg.jpg)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  },
  card: {
    width: "100%",
    maxWidth: "440px",
    padding: "40px",
    borderRadius: "16px",
    background: "rgba(15, 23, 42, 0.85)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "10px",
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    color: "#ffffff",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
  },
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
        style={{
          ...styles.input,
          border: error ? "1px solid #ef4444" : styles.input.border
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
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h2 style={{ fontSize: "32px", fontWeight: "700", color: "#ffffff" }}>
            Create Account
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>
            Join EventFlow today
          </p>
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
              style={styles.input}
            >
              <option value="participant">Participant</option>
              <option value="mentor">Mentor</option>
              <option value="judge">Judge</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {status.error && (
            <div style={{
              padding: "12px",
              borderRadius: "8px",
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#fca5a5",
              fontSize: "13px",
              textAlign: "center",
              marginBottom: "16px"
            }}>
              {status.error}
            </div>
          )}

          {status.success && (
            <div style={{
              padding: "12px",
              borderRadius: "8px",
              background: "rgba(34, 197, 94, 0.15)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              color: "#86efac",
              fontSize: "13px",
              textAlign: "center",
              marginBottom: "16px"
            }}>
              {status.success}
            </div>
          )}

          <button
            type="submit"
            disabled={status.loading}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "10px",
              background: status.loading
                ? "rgba(59, 130, 246, 0.6)"
                : "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              color: "#ffffff",
              fontWeight: "600",
              fontSize: "15px",
              border: "none",
              cursor: status.loading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 14px 0 rgba(59, 130, 246, 0.4)",
            }}
          >
            {status.loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}




