import { roles } from "../../data";

function AuthPanel({ activeRole, onRoleChange }) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="panel overflow-hidden">
        <div className="border-b border-amber-100 p-6">
          <p className="eyebrow">Authentication & User Management</p>
          <h2 className="section-title">Sign in, register, and switch roles</h2>
          <p className="section-copy">
            This frontend is prepared for JWT or OAuth-based authentication.
            The forms are presentation-ready and can be connected to GraphQL
            mutations later.
          </p>
        </div>
        <div className="grid gap-4 p-6 md:grid-cols-2">
          <form className="card">
            <h3 className="card-title">Login</h3>
            <label className="field">
              <span>Email</span>
              <input type="email" placeholder="alex@neighbourhq.ca" />
            </label>
            <label className="field">
              <span>Password</span>
              <input type="password" placeholder="••••••••" />
            </label>
            <button type="button" className="primary-btn">
              Continue with JWT
            </button>
            <div className="flex gap-3 pt-2">
              <button type="button" className="secondary-btn">
                Google
              </button>
              <button type="button" className="secondary-btn">
                GitHub
              </button>
            </div>
          </form>

          <form className="card">
            <h3 className="card-title">Register</h3>
            <label className="field">
              <span>Full name</span>
              <input type="text" placeholder="Jordan Lee" />
            </label>
            <label className="field">
              <span>Neighbourhood</span>
              <input type="text" placeholder="Riverdale West" />
            </label>
            <label className="field">
              <span>Preferred role</span>
              <select
                value={activeRole}
                onChange={(event) => onRoleChange(event.target.value)}
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" className="primary-btn">
              Create account
            </button>
          </form>
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
