import {
  ArrowRight,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react";

import { useEffect, useState } from "react";

function Navbar({
  onGetStarted,
  onLogin,
  session,
  onLogout,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /*
   * -------------------------------------------------
   * SCROLL STATE
   * -------------------------------------------------
   */

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  /*
   * -------------------------------------------------
   * LOCK BODY WHEN MOBILE MENU IS OPEN
   * -------------------------------------------------
   */

  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add(
        "mobile-menu-active"
      );
    } else {
      document.body.classList.remove(
        "mobile-menu-active"
      );
    }

    return () => {
      document.body.classList.remove(
        "mobile-menu-active"
      );
    };
  }, [menuOpen]);

  /*
   * -------------------------------------------------
   * CLOSE MENU
   * -------------------------------------------------
   */

  const closeMenu = () => {
    setMenuOpen(false);
  };

  /*
   * -------------------------------------------------
   * SCROLL TO SECTION
   * -------------------------------------------------
   */

  const scrollToSection = (id) => {
    closeMenu();

    const section =
      document.getElementById(id);

    if (!section) {
      return;
    }

    const navbarHeight = 82;

    const sectionTop =
      section.getBoundingClientRect().top +
      window.scrollY -
      navbarHeight;

    window.scrollTo({
      top: Math.max(sectionTop, 0),
      behavior: "smooth",
    });
  };

  /*
   * -------------------------------------------------
   * GO HOME / TOP
   * -------------------------------------------------
   */

  const goToTop = (event) => {
    event.preventDefault();

    closeMenu();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
   * -------------------------------------------------
   * GET STARTED
   * -------------------------------------------------
   */

  const handleGetStarted = () => {
    closeMenu();

    if (onGetStarted) {
      onGetStarted();
    }
  };

  /*
   * -------------------------------------------------
   * LOGIN
   * -------------------------------------------------
   */

  const handleLogin = () => {
    closeMenu();

    if (onLogin) {
      onLogin();
    }
  };

  /*
   * -------------------------------------------------
   * LOGOUT
   * -------------------------------------------------
   */

  const handleLogout = async () => {
    closeMenu();

    if (onLogout) {
      await onLogout();
    }
  };

  /*
   * -------------------------------------------------
   * TOGGLE MOBILE MENU
   * -------------------------------------------------
   */

  const toggleMenu = () => {
    setMenuOpen(
      (previous) => !previous
    );
  };

  /*
   * -------------------------------------------------
   * USER STATE
   * -------------------------------------------------
   */

  const isLoggedIn = Boolean(session);

  return (
    <header
      className={`navbar ${
        scrolled
          ? "navbar-scrolled"
          : ""
      } ${
        menuOpen
          ? "navbar-menu-open"
          : ""
      }`}
    >
      <div className="navbar-container">

        {/* BRAND */}

        <a
          href="#top"
          className="brand"
          onClick={goToTop}
          aria-label="CycleCare home"
        >
          <span className="brand-symbol">
            C
          </span>

          <span className="brand-name">
            CycleCare
          </span>
        </a>

        {/* DESKTOP NAVIGATION */}

        <nav
          className="nav-links"
          aria-label="Main navigation"
        >
          <button
            type="button"
            onClick={() =>
              scrollToSection(
                "features"
              )
            }
          >
            Features
          </button>

          <button
            type="button"
            onClick={() =>
              scrollToSection(
                "how-it-works"
              )
            }
          >
            How It Works
          </button>

          <button
            type="button"
            onClick={() =>
              scrollToSection(
                "product-preview"
              )
            }
          >
            Product
          </button>

          <button
            type="button"
            onClick={() =>
              scrollToSection(
                "wellness"
              )
            }
          >
            Wellness
          </button>

          <button
            type="button"
            onClick={() =>
              scrollToSection(
                "privacy"
              )
            }
          >
            Privacy
          </button>
        </nav>

        {/* DESKTOP ACTIONS */}

        <div className="nav-actions">

          {isLoggedIn ? (
            <>
              <button
                className="login-button"
                type="button"
                onClick={() =>
                  scrollToSection(
                    "product-preview"
                  )
                }
              >
                <UserRound
                  size={15}
                  strokeWidth={1.8}
                />

                <span>
                  Account
                </span>
              </button>

              <button
                className="nav-cta"
                type="button"
                onClick={handleLogout}
              >
                <span>
                  Log out
                </span>

                <LogOut
                  size={16}
                  strokeWidth={1.9}
                />
              </button>
            </>
          ) : (
            <>
              <button
                className="login-button"
                type="button"
                onClick={handleLogin}
              >
                Log in
              </button>

              <button
                className="nav-cta"
                type="button"
                onClick={
                  handleGetStarted
                }
              >
                <span>
                  Get Started
                </span>

                <ArrowRight
                  size={16}
                  strokeWidth={1.9}
                  aria-hidden="true"
                />
              </button>
            </>
          )}

        </div>

        {/* MOBILE MENU BUTTON */}

        <button
          className="mobile-menu-button"
          type="button"
          onClick={toggleMenu}
          aria-label={
            menuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
        >
          <span className="mobile-menu-icon">
            {menuOpen ? (
              <X
                size={21}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            ) : (
              <Menu
                size={21}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            )}
          </span>
        </button>
      </div>

      {/* MOBILE NAVIGATION */}

      <div
        id="mobile-navigation"
        className={`mobile-menu ${
          menuOpen
            ? "mobile-menu-open"
            : ""
        }`}
        aria-hidden={!menuOpen}
      >
        <div className="mobile-menu-inner">

          <nav
            className="mobile-nav-links"
            aria-label="Mobile navigation"
          >
            <button
              type="button"
              onClick={() =>
                scrollToSection(
                  "features"
                )
              }
            >
              <span>
                Features
              </span>

              <ArrowRight
                size={15}
                strokeWidth={1.7}
              />
            </button>

            <button
              type="button"
              onClick={() =>
                scrollToSection(
                  "how-it-works"
                )
              }
            >
              <span>
                How It Works
              </span>

              <ArrowRight
                size={15}
                strokeWidth={1.7}
              />
            </button>

            <button
              type="button"
              onClick={() =>
                scrollToSection(
                  "product-preview"
                )
              }
            >
              <span>
                Product
              </span>

              <ArrowRight
                size={15}
                strokeWidth={1.7}
              />
            </button>

            <button
              type="button"
              onClick={() =>
                scrollToSection(
                  "wellness"
                )
              }
            >
              <span>
                Wellness
              </span>

              <ArrowRight
                size={15}
                strokeWidth={1.7}
              />
            </button>

            <button
              type="button"
              onClick={() =>
                scrollToSection(
                  "privacy"
                )
              }
            >
              <span>
                Privacy
              </span>

              <ArrowRight
                size={15}
                strokeWidth={1.7}
              />
            </button>
          </nav>

          {/* MOBILE ACTIONS */}

          <div className="mobile-menu-actions">

            {isLoggedIn ? (
              <button
                className="mobile-login"
                type="button"
                onClick={
                  handleLogout
                }
              >
                <LogOut
                  size={16}
                  strokeWidth={1.8}
                />

                <span>
                  Log out
                </span>
              </button>
            ) : (
              <button
                className="mobile-login"
                type="button"
                onClick={handleLogin}
              >
                Log in
              </button>
            )}

            {!isLoggedIn && (
              <button
                className="mobile-cta"
                type="button"
                onClick={
                  handleGetStarted
                }
              >
                <span>
                  Get Started
                </span>

                <ArrowRight
                  size={16}
                  strokeWidth={1.9}
                />
              </button>
            )}

          </div>

          {/* MOBILE MENU FOOTER */}

          <div className="mobile-menu-note">
            <span className="mobile-menu-note-dot"></span>

            <span>
              {isLoggedIn
                ? "Your account is securely connected."
                : "Thoughtful tracking. Better preparation."}
            </span>
          </div>

        </div>
      </div>
    </header>
  );
}

export default Navbar;