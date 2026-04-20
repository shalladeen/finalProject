import { useState } from "react";
import { gql } from "@apollo/client";
import { authClient } from "../../apolloClient";
import { roles } from "../../data";

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user { id username role neighborhood }
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($username: String!, $email: String!, $password: String!, $role: String, $neighborhood: String) {
    register(username: $username, email: $email, password: $password, role: $role, neighborhood: $neighborhood) {
      token
      user { id username role neighborhood }
    }
  }
`;

function AuthPanel({ activeRole, onRoleChange, onAuthSuccess }) {
  const [mode, setMode] = useState("login");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ username: "", email: "", password: "", neighborhood: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleLogin = async () => {
    setError(""); setSuccess(""); setLoading(true);
    try {
      const { data } = await authClient.mutate({ mutation: LOGIN_MUTATION, variables: loginForm });
      const { token, user } = data.login;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      onRoleChange(user.role);
      setSuccess(`Welcome back, ${user.username}!`);
      setTimeout(() => onAuthSuccess && onAuthSuccess(), 800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError(""); setSuccess(""); setLoading(true);
    try {
      const { data } = await authClient.mutate({
        mutation: REGISTER_MUTATION,
        variables: { ...registerForm, role: activeRole },
      });
      const { token, user } = data.register;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      onRoleChange(user.role);
      setSuccess(`Account created! Welcome, ${user.username}!`);
      setTimeout(() => onAuthSuccess && onAuthSuccess(), 800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-hero">
        <h1 className="auth-hero-title">Welcome to NeighbourHQ</h1>
        <p className="auth-hero-copy">Connect with your neighbourhood — sign in or create an account to get started.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        {/* Form */}
        <div className="panel">
          {/* Mode switcher */}
          <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
            <button
              className={`flex-1 py-3 text-sm font-semibold transition ${mode === "login" ? "text-green-700 border-b-2 border-green-700" : "text-slate-500"}`}
              style={{ borderColor: mode === "login" ? "var(--green)" : "transparent", color: mode === "login" ? "var(--green)" : "var(--ink-soft)" }}
              onClick={() => setMode("login")}
            >
              Sign In
            </button>
            <button
              className="flex-1 py-3 text-sm font-semibold transition"
              style={{ borderBottom: mode === "register" ? "2px solid var(--green)" : "2px solid transparent", color: mode === "register" ? "var(--green)" : "var(--ink-soft)" }}
              onClick={() => setMode("register")}
            >
              Create Account
            </button>
          </div>

          <div className="p-6 space-y-4">
            {error && <div className="banner-error">{error}</div>}
            {success && <div className="banner-success">{success}</div>}

            {mode === "login" ? (
              <>
                <label className="field">
                  <span>Email</span>
                  <input type="email" placeholder="you@example.com" value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} />
                </label>
                <label className="field">
                  <span>Password</span>
                  <input type="password" placeholder="••••••••" value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
                </label>
                <button className="primary-btn w-full" onClick={handleLogin} disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </>
            ) : (
              <>
                <label className="field">
                  <span>Username</span>
                  <input type="text" placeholder="Your name" value={registerForm.username}
                    onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })} />
                </label>
                <label className="field">
                  <span>Email</span>
                  <input type="email" placeholder="you@example.com" value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} />
                </label>
                <label className="field">
                  <span>Password</span>
                  <input type="password" placeholder="••••••••" value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} />
                </label>
                <label className="field">
                  <span>Neighbourhood</span>
                  <input type="text" placeholder="e.g. Riverdale" value={registerForm.neighborhood}
                    onChange={(e) => setRegisterForm({ ...registerForm, neighborhood: e.target.value })} />
                </label>
                <button className="primary-btn w-full" onClick={handleRegister} disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Role selector */}
        <div className="space-y-3">
          <p className="eyebrow mb-4">Choose your role</p>
          <p className="section-copy" style={{ marginTop: "-0.5rem", marginBottom: "1rem" }}>
            Select a role before creating your account.
          </p>
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => onRoleChange(role.id)}
              className={`role-card ${activeRole === role.id ? "role-card-active" : ""}`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="card-title">{role.name}</h3>
                {activeRole === role.id && <span className="chip chip-strong">Selected</span>}
              </div>
              <p className="section-copy">{role.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AuthPanel;