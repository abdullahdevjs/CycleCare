import { ArrowRight, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { supabase } from "../lib/supabase";

function SignupModal({ onClose, onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignup = async () => {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const { error } =
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: window.location.origin,
          },
        });

      if (error) {
        console.error(
          "Google signup error:",
          error
        );

        setError(
          "Unable to continue with Google. Please try again."
        );

        setLoading(false);
      }
    } catch (error) {
      console.error(
        "Google signup error:",
        error
      );

      setError(
        "Something went wrong. Please try again."
      );

      setLoading(false);
    }
  };

  const handleLogin = () => {
    if (loading) return;

    if (onLogin) {
      onLogin();
    }
  };

  return (
    <div
      className="signup-overlay"
      onClick={onClose}
    >
      <div
        className="signup-modal google-only-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
        role="dialog"
        aria-modal="true"
        aria-labelledby="signup-title"
      >
        {/* CLOSE */}

        <button
          className="signup-close"
          type="button"
          onClick={onClose}
          aria-label="Close signup"
          disabled={loading}
        >
          <X
            size={18}
            strokeWidth={1.8}
          />
        </button>

        {/* HEADER */}

        <div className="signup-header">
          <div className="signup-symbol">
            C
          </div>

          <span>
            GET STARTED
          </span>

          <h2 id="signup-title">
            Begin your
            <em> CycleCare journey.</em>
          </h2>

          <p>
            Create your account securely with
            Google and start using CycleCare.
          </p>
        </div>

        {/* GOOGLE */}

        <button
          type="button"
          className="google-signin-button google-primary-button"
          onClick={handleGoogleSignup}
          disabled={loading}
        >
          <span className="google-logo">
            G
          </span>

          <span>
            {loading
              ? "Connecting..."
              : "Continue with Google"}
          </span>

          {!loading && (
            <ArrowRight
              size={16}
              strokeWidth={1.9}
            />
          )}
        </button>

        {/* ERROR */}

        {error && (
          <div
            className="auth-message google-auth-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* SECURITY */}

        <div className="signup-privacy google-security">
          <ShieldCheck
            size={15}
            strokeWidth={1.7}
          />

          <span>
            Secure authentication powered by
            Google.
          </span>
        </div>

        {/* LOGIN */}

        <p className="signup-login">
          Already have an account?

          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}

export default SignupModal;