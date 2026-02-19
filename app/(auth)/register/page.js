"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { validateRegister } from "@/utils/validateRegister";

/* ---------------------- styles ---------------------- */

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
  },
  card: {
    width: "100%",
    maxWidth: "440px",
    padding: "40px",
    borderRadius: "16px",
    background: "rgba(15, 23, 42, 0.85)",
    backdropFilter: "blur(20px)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.15)",
    color: "#fff",
    fontSize: "15px",
  },
  label: {
    fontSize: "12px",
    fontWeight: 600,
    color: "rgba(255,255,255,0.8)",
    marginBottom: "8px",
    display: "block",
  },
};

/* ---------------------- InputField ---------------------- */

function InputField({ label, type, name, value, onChange, disabled, placeholder, error }: any) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={styles.label}>{label}</label>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        style={{
          ...styles.input,
          border: error ? "1px solid #ef4444" : styles.input.border,
        }}
      />

      {error && <p style={{ color: "#f87171", fontSize: 12 }}>{error}</p>}
    </div>
  );
}

/* ---------------------- Page ---------------------- */

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "participant",
  });

  const [errors, setErrors] = useState<any>({});

  const [status, setStatus] = useState({
    error: "",
    success: "",
    loading: false,
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    setFormData((p) => ({ ...p, [name]: value }));

    if (errors[name]) {
      setErrors((p: any) => ({ ...p, [name]: "" }));
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const validationErrors = validateRegister(formData);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setStatus({ error: "", success: "", loading: true });

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setStatus({
        error: "",
        success: "Registration successful! Redirecting...",
        loading: false,
      });

      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      setStatus({
        error: err.message || "Something went wrong",
        success: "",
        loading: false,
      });
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={{ textAlign: "center", color: "white", marginBottom: 30 }}>
          Create Account
        </h2>

        <form onSubmit={handleSubmit}>
          <InputField label="Full Name" name="name" type="text" value={formData.name} onChange={handleChange} disabled={status.loading} placeholder="Enter name" error={errors.name} />

          <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} disabled={status.loading} placeholder="Enter email" error={errors.email} />

          <InputField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} disabled={status.loading} placeholder="Create password" error={errors.password} />

          <div style={{ marginBottom: 20 }}>
            <label style={styles.label}>Role</label>
            <select name="role" value={formData.role} onChange={handleChange} style={styles.input}>
              <option value="participant">Participant</option>
              <option value="mentor">Mentor</option>
              <option value="judge">Judge</option>
            </select>
          </div>

          {status.error && <p style={{ color: "#f87171" }}>{status.error}</p>}
          {status.success && <p style={{ color: "#4ade80" }}>{status.success}</p>}

          <button
            type="submit"
            disabled={status.loading}
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 10,
              border: "none",
              background: "#3b82f6",
              color: "white",
              marginTop: 10,
              cursor: "pointer",
            }}
          >
            {status.loading ? "Creating..." : "Sign Up"}
          </button>

          <p style={{ textAlign: "center", marginTop: 20, color: "#9ca3af" }}>
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
