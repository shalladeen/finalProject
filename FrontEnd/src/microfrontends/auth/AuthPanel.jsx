import { useState } from "react";
import { gql } from "@apollo/client";
import { authClient } from "../../apolloClient";
import { roles } from "../../data";

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        username
        role
        neighborhood
      }
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register(
    $username: String!
    $email: String!
    $password: String!
    $role: String
    $neighborhood: String
  ) {
    register(
      username: $username
      email: $email
      password: $password
      role: $role
      neighborhood: $neighborhood
    ) {
      token
      user {
        id
        username
        role
        neighborhood
      }
    }
  }
`;

function AuthPanel({ activeRole, onRoleChange, onAuthSuccess }) {
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
    neighborhood: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleLogin = async () => {
    setError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      const { data } = await authClient.mutate({
        mutation: LOGIN_MUTATION,
        variables: loginForm,
      });
      const { token, user } = data.login;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      onRoleChange(user.role);
      setSuccessMsg(`Welcome back, ${user.username}!`);
      if (onAuthSuccess) onAuthSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      const { data } = await authClient.mutate({
        mutation: REGISTER_MUTATION,
        variables: { ...registerForm, role: activeRole },
      });
      const { token, user } = data.register;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      onRoleChange(user.role);
      setSuccessMsg(`Account created! Welcome, ${user.username}!`);
      if (onAuthSuccess) onAuthSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="panel overflow-hidden">
        <div className="border-b border-amber-100 p-6">
          <p className="eyebrow">Authentication & User Management</p>
          <h2 className="section-title">Sign in, register, and switch roles</h2>
          <p className="section-copy">
            JWT-based authentication connected to the auth microservice.
          </p>
        </div>

        {error && (
          <div className="mx-6 mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            {successMsg}
          </div>
        )}

        <div className="grid gap-4 p-6 md:grid-cols-2">
          <div className="card">
            <h3 className="card-title">Login</h3>
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                placeholder="alex@neighbourhq.ca"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                type="password"
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              />
            </label>
            <button
              type="button"
              className="primary-btn"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Continue with JWT"}
            </button>
          </div>

          <div className="card">
            <h3 className="card-title">Register</h3>
            <label className="field">
              <span>Username</span>
              <input
                type="text"
                placeholder="Jordan Lee"
                value={registerForm.username}
                onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                placeholder="jordan@neighbourhq.ca"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                type="password"
                placeholder="••••••••"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Neighbourhood</span>
              <input
                type="text"
                placeholder="Riverdale West"
                value={registerForm.neighborhood}
                onChange={(e) => setRegisterForm({ ...registerForm, neighborhood: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Preferred role</span>
              <select
                value={activeRole}
                onChange={(e) => onRoleChange(e.target.value)}
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="primary-btn"
              onClick={handleRegister}
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </div>
        </div>
      </div>

      <aside className="panel p-6">
        <p className="eyebrow">User Roles</p>
        <div className="space-y-4">
          {roles.map((role) => {
            const isActive = activeRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => onRoleChange(role.id)}
                className={`role-card ${isActive ? "role-card-active" : ""}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="card-title">{role.name}</h3>
                  <span className="chip">{role.badge}</span>
                </div>
                <p className="section-copy text-left">{role.description}</p>
              </button>
            );
          })}
        </div>
      </aside>
    </section>
  );
}

export default AuthPanel;