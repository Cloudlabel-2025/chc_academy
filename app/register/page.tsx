"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/dashboard";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Registration failed. Please check your details.");
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
        <div className="col-12 col-md-8 col-lg-6">
          <div className="text-center mb-4">
            <Link href="/" className="text-decoration-none">
              <span className="fs-3 fw-bold text-dark">
                <i className="bi bi-mortarboard-fill text-primary me-2"></i>
                CHC · ORACLE HCM
              </span>
              <div className="text-secondary small text-uppercase tracking-wide">
                Trainee Registration
              </div>
            </Link>
          </div>

          <div className="card shadow-sm border-0 rounded-3">
            <div className="card-body p-4 p-md-5">
              <h4 className="card-title fw-bold text-center mb-1">Create an Account</h4>
              <p className="text-muted text-center small mb-4">
                Begin your structured Oracle HCM functional training path
              </p>

              {error && (
                <div className="alert alert-danger py-2 small d-flex align-items-center" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Full Name</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-person text-muted"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-0"
                      placeholder="e.g. Jenny Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>

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

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-lock text-muted"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control border-start-0 ps-0"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold">Confirm Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-shield-lock text-muted"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control border-start-0 ps-0"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                      Creating account...
                    </>
                  ) : (
                    <>
                      Register Now <i className="bi bi-arrow-right ms-2"></i>
                    </>
                  )}
                </button>
              </form>

              <hr className="my-4 text-muted" />

              <div className="text-center small">
                Already registered?{" "}
                <Link href={`/login?returnTo=${encodeURIComponent(returnTo)}`} className="text-primary fw-semibold text-decoration-none">
                  Sign In here
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

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="container py-5 text-center">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
