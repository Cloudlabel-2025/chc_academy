"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/dashboard";
  const isLogout = searchParams.get("logout") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [logoutNotice, setLogoutNotice] = useState(isLogout);

  useEffect(() => {
    if (isLogout) {
      fetch("/api/auth/logout", { method: "POST" })
        .then(() => setLogoutNotice(true))
        .catch(() => {});
    }
  }, [isLogout]);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Login failed. Please check your credentials.");
        return;
      }

      router.push(returnTo);
      router.refresh();
    } catch {
      setLoading(false);
      setError("An unexpected error occurred. Please try again.");
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="text-center mb-4">
            <Link href="/" className="text-decoration-none">
              <span className="fs-3 fw-bold text-dark">
                <i className="bi bi-mortarboard-fill text-primary me-2"></i>
                CHC · ORACLE HCM
              </span>
              <div className="text-secondary small text-uppercase tracking-wide">
                Academy Portal
              </div>
            </Link>
          </div>

          <div className="card shadow-sm border-0 rounded-3">
            <div className="card-body p-4 p-md-5">
              <h4 className="card-title fw-bold text-center mb-1">Sign In</h4>
              <p className="text-muted text-center small mb-4">
                Access your training curriculum, submissions & simulator
              </p>

              {logoutNotice && (
                <div className="alert alert-info py-2 small d-flex align-items-center" role="alert">
                  <i className="bi bi-info-circle-fill me-2"></i>
                  You have been successfully signed out.
                </div>
              )}

              {error && (
                <div className="alert alert-danger py-2 small d-flex align-items-center" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-envelope text-muted"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control border-start-0 ps-0"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-lock text-muted"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control border-start-0 ps-0"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In <i className="bi bi-arrow-right ms-2"></i>
                    </>
                  )}
                </button>
              </form>

              <hr className="my-4 text-muted" />

              <div className="text-center small">
                Don&apos;t have an account yet?{" "}
                <Link href={`/register?returnTo=${encodeURIComponent(returnTo)}`} className="text-primary fw-semibold text-decoration-none">
                  Register here
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center mt-4">
            <Link href="/" className="text-muted small text-decoration-none">
              <i className="bi bi-arrow-left me-1"></i> Back to Academy Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container py-5 text-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
