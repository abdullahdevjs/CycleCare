import {
  ArrowRight,
  Bell,
  CalendarDays,
  LockKeyhole,
  Play,
  ShieldCheck,
  UserRound,
} from "lucide-react";

function Hero({ onGetStarted }) {
  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    }
  };

  const scrollToHowItWorks = () => {
    const section = document.getElementById("how-it-works");

    if (!section) {
      return;
    }

    const navbarOffset = 82;

    const targetPosition =
      section.getBoundingClientRect().top +
      window.scrollY -
      navbarOffset;

    window.scrollTo({
      top: Math.max(targetPosition, 0),
      behavior: "smooth",
    });
  };

  return (
    <section className="hero" id="top">
      <div className="hero-container">

        {/* =====================================================
            HERO CONTENT
        ===================================================== */}

        <div className="hero-content">

          <div className="hero-eyebrow">
            <span className="eyebrow-dot" />

            <span>
              Thoughtful tracking. Better preparation.
            </span>
          </div>


          <h1>
            Understand your cycle.
            <span>
              Prepare with confidence.
            </span>
          </h1>


          <p className="hero-description">
            CycleCare helps you keep track of your cycle,
            estimate your upcoming period, and receive a
            gentle reminder before it begins—so you can stay
            one step ahead.
          </p>


          {/* =================================================
              HERO ACTIONS
          ================================================= */}

          <div className="hero-actions">

            <button
              className="primary-button"
              type="button"
              onClick={handleGetStarted}
              aria-label="Get started with CycleCare"
            >
              <span>
                Get Started Free
              </span>

              <ArrowRight
                size={17}
                strokeWidth={2}
                aria-hidden="true"
              />
            </button>


            <button
              className="secondary-button"
              type="button"
              onClick={scrollToHowItWorks}
              aria-label="See how CycleCare works"
            >
              <Play
                size={15}
                strokeWidth={2}
                aria-hidden="true"
              />

              <span>
                See How It Works
              </span>
            </button>

          </div>


          {/* =================================================
              TRUST POINTS
          ================================================= */}

          <div className="hero-trust">

            <div className="trust-item">

              <div className="trust-icon">
                <LockKeyhole
                  size={17}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
              </div>

              <div>
                <strong>
                  Private by design
                </strong>

                <span>
                  Your information stays protected.
                </span>
              </div>

            </div>


            <div className="trust-item">

              <div className="trust-icon">
                <ShieldCheck
                  size={17}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
              </div>

              <div>
                <strong>
                  Thoughtful experience
                </strong>

                <span>
                  Simple, focused and distraction-free.
                </span>
              </div>

            </div>


            <div className="trust-item">

              <div className="trust-icon">
                <UserRound
                  size={17}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
              </div>

              <div>
                <strong>
                  You stay in control
                </strong>

                <span>
                  Manage your preferences anytime.
                </span>
              </div>

            </div>

          </div>

        </div>


        {/* =====================================================
            HERO VISUAL
        ===================================================== */}

        <div className="hero-visual">

          {/* =================================================
              LIFESTYLE IMAGE
          ================================================= */}

          <div className="hero-photo">

            <img
              src="/hero-image.png"
              alt="Woman using CycleCare in a calm wellness setting"
              loading="eager"
              fetchPriority="high"
            />

          </div>


          {/* =================================================
              PHONE PREVIEW
          ================================================= */}

          <div
            className="hero-phone"
            aria-label="CycleCare mobile dashboard preview"
          >

            <div className="phone-notch" />


            {/* PHONE STATUS BAR */}

            <div className="phone-topbar">

              <span>
                9:41
              </span>

              <div className="phone-status">
                <span />
                <span />
                <span />
              </div>

            </div>


            {/* PHONE HEADER */}

            <div className="phone-header">

              <div>
                <span>
                  Good morning
                </span>

                <h3>
                  Cycle overview
                </h3>
              </div>

              <div className="phone-avatar">
                A
              </div>

            </div>


            {/* PERIOD CARD */}

            <div className="phone-period-card">

              <div className="phone-card-heading">

                <span>
                  Next period
                </span>

                <CalendarDays
                  size={15}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />

              </div>


              <div className="phone-period-value">

                <strong>
                  4
                </strong>

                <span>
                  days
                </span>

              </div>


              <p>
                Expected around September 15
              </p>


              <div className="phone-progress">
                <span />
              </div>

            </div>


            {/* CALENDAR */}

            <div className="phone-calendar">

              <div className="calendar-title">

                <strong>
                  September 2026
                </strong>

                <span>
                  Cycle day 24
                </span>

              </div>


              <div className="calendar-days">

                {/* WEEK */}

                <span>M</span>
                <span>T</span>
                <span>W</span>
                <span>T</span>
                <span>F</span>
                <span>S</span>
                <span>S</span>


                {/* DATES */}

                <span>31</span>
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>

                <span>7</span>
                <span>8</span>
                <span>9</span>
                <span>10</span>

                <span className="calendar-today">
                  11
                </span>

                <span>12</span>
                <span>13</span>

                <span>14</span>

                <span className="calendar-period">
                  15
                </span>

                <span>16</span>
                <span>17</span>
                <span>18</span>
                <span>19</span>
                <span>20</span>

              </div>

            </div>


            {/* PHONE REMINDER */}

            <div className="phone-reminder">

              <div className="phone-reminder-icon">

                <Bell
                  size={15}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />

              </div>

              <div>

                <span>
                  Upcoming reminder
                </span>

                <strong>
                  11 Sep · 9:00 AM
                </strong>

              </div>

            </div>

          </div>


          {/* =================================================
              FLOATING NOTIFICATION
          ================================================= */}

          <div className="hero-notification">

            <div className="notification-icon">

              <Bell
                size={17}
                strokeWidth={1.8}
                aria-hidden="true"
              />

            </div>


            <div>

              <span>
                CycleCare
              </span>

              <strong>
                Your period may be approaching.
              </strong>

              <p>
                Estimated in 3 days.
              </p>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default Hero;