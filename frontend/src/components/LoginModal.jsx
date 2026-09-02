import { ArrowRight, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { supabase } from "../lib/supabase";

function LoginModal({ onClose, onSignup }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accountFound, setAccountFound] = useState(false);

  const handleCheckAccount = async (event) => {
    event.preventDefault();

    if (loading) return;

    setError("");
    setAccountFound(false);

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        normalizedEmail
      )
    ) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      console.log(
        "Checking account:",
        normalizedEmail
      );

      const { data, error } =
        await supabase.functions.invoke(
          "check-user-email",
          {
            body: {
              email: normalizedEmail,
            },
          }
        );

      console.log(
        "Function data:",
        data
      );

      console.log(
        "Function error:",
        error
      );

      if (error) {
        console.error(
          "Account check error:",
          error
        );

        let detailedMessage =
          "Unable to check your account. Please try again.";

        try {
          if (error.context) {
            const responseText =
              await error.context.text();

            console.error(
              "Function response:",
              responseText
            );

            if (responseText) {
              try {
                const responseData =
                  JSON.parse(responseText);

                if (responseData?.error) {
                  detailedMessage =
                    responseData.error;
                } else if (
                  responseData?.message
                ) {
                  detailedMessage =
                    responseData.message;
                }
              } catch {
                detailedMessage =
                  responseText;
              }
            }
          }
        } catch (parseError) {
          console.error(
            "Could not read function error:",
            parseError
          );
        }

        setError(detailedMessage);
        return;
      }

      if (!data) {
        setError(
          "No response received from the authentication server."
        );
        return;
      }

      if (data.exists === true) {
        setAccountFound(true);
        return;
      }

      if (data.exists === false) {
        setError(
          "No CycleCare account found with this email. Please use Get Started first."
        );
        return;
      }

      setError(
        "Unexpected response from the authentication server."
      );
    } catch (error) {
      console.error(
        "Account check exception:",
        error
      );

      setError(
        error?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const { error } =
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo:
              window.location.origin,

            queryParams: {
              login_hint:
                email.trim().toLowerCase(),
            },
          },
        });

      if (error) {
        console.error(
          "Google login error:",
          error
        );

        setError(
          error.message ||
            "Unable to continue with Google. Please try again."
        );

        setLoading(false);
      }
    } catch (error) {
      console.error(
        "Google login exception:",
        error
      );

      setError(
        error?.message ||
          "Something went wrong. Please try again."
      );

      setLoading(false);
    }
  };

  const handleSignup = () => {
    if (loading) return;

    if (onSignup) {
      onSignup();
    }
  };

  return (
    <div
      className="signup-overlay"
      onClick={onClose}
    >
      <div
        className="signup-modal login-modal google-only-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
      >
        {/* CLOSE */}

        <button
          className="signup-close"
          type="button"
          onClick={onClose}
          aria-label="Close login"
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
            WELCOME BACK
          </span>

          <h2 id="login-title">
            Good to see
            <em> you again.</em>
          </h2>

          <p>
            Enter your account email to
            continue securely with Google.
          </p>
        </div>

        {/* EMAIL STEP */}

        {!accountFound && (
          <form
            onSubmit={handleCheckAccount}
            noValidate
          >
            <label className="auth-field-label">
              Email address
            </label>

            <input
              className="auth-email-input"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
              placeholder="Enter your CycleCare email"
              autoComplete="email"
              autoFocus
              disabled={loading}
            />

            <button
              type="submit"
              className="google-signin-button google-primary-button"
              disabled={loading}
            >
              <span>
                {loading
                  ? "Checking account..."
                  : "Continue"}
              </span>

              {!loading && (
                <ArrowRight
                  size={16}
                  strokeWidth={1.9}
                />
              )}
            </button>
          </form>
        )}

        {/* ACCOUNT FOUND */}

        {accountFound && (
          <>
            <div className="account-found-message">
              <ShieldCheck
                size={17}
                strokeWidth={1.8}
              />

              <span>
                Account found. Continue with
                Google to sign in.
              </span>
            </div>

            <button
              type="button"
              className="google-signin-button google-primary-button"
              onClick={handleGoogleLogin}
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

            <button
              type="button"
              className="change-email-button"
              onClick={() => {
                setAccountFound(false);
                setError("");
              }}
              disabled={loading}
            >
              Use a different email
            </button>
          </>
        )}

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

        {/* SIGN UP */}

        <p className="signup-login">
          New to CycleCare?

          <button
            type="button"
            onClick={handleSignup}
            disabled={loading}
          >
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginModal;