import {
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  LockKeyhole,
} from "lucide-react";

function ProductPreview() {
  return (
    <section
      className="product-preview-section"
      id="product-preview"
    >
      <div className="product-preview-container">

        {/* HEADER */}

        <div className="product-preview-heading">

          <span className="section-eyebrow">
            THE CYCLECARE EXPERIENCE
          </span>

          <h2>
            Everything important.
            <span> Clear at a glance.</span>
          </h2>

          <p>
            A calm dashboard designed to give you the
            information you need without making cycle
            tracking feel complicated.
          </p>

        </div>

        {/* PRODUCT SHOWCASE */}

        <div className="product-showcase">

          {/* LEFT SIDE */}

          <div className="product-showcase-copy">

            <span className="product-kicker">
              YOUR PERSONAL OVERVIEW
            </span>

            <h3>
              Know where you are
              <span> in your cycle.</span>
            </h3>

            <p>
              See your upcoming period, cycle day, and
              reminder status in one focused view.
            </p>

            <div className="product-benefits">

              <div className="product-benefit">

                <div className="product-benefit-icon">
                  <CalendarDays
                    size={17}
                    strokeWidth={1.7}
                  />
                </div>

                <div>
                  <strong>
                    Clear cycle overview
                  </strong>

                  <span>
                    Important dates in one place.
                  </span>
                </div>

              </div>

              <div className="product-benefit">

                <div className="product-benefit-icon">
                  <Bell
                    size={17}
                    strokeWidth={1.7}
                  />
                </div>

                <div>
                  <strong>
                    Timely reminders
                  </strong>

                  <span>
                    A gentle heads-up before your period.
                  </span>
                </div>

              </div>

              <div className="product-benefit">

                <div className="product-benefit-icon">
                  <LockKeyhole
                    size={17}
                    strokeWidth={1.7}
                  />
                </div>

                <div>
                  <strong>
                    Privacy at the core
                  </strong>

                  <span>
                    Designed with your information in mind.
                  </span>
                </div>

              </div>

            </div>

            <button
              type="button"
              className="product-preview-link"
              onClick={() => {
                const section =
                  document.getElementById("features");

                if (section) {
                  section.scrollIntoView({
                    behavior: "smooth",
                  });
                }
              }}
            >
              Explore CycleCare features

              <ArrowRight
                size={16}
                strokeWidth={1.8}
              />
            </button>

          </div>

          {/* DASHBOARD PREVIEW */}

          <div className="product-dashboard">

            <div className="dashboard-topbar">

              <div className="dashboard-brand">
                <span className="dashboard-brand-symbol">
                  C
                </span>

                <strong>
                  CycleCare
                </strong>
              </div>

              <div className="dashboard-profile">
                A
              </div>

            </div>

            <div className="dashboard-content">

              <div className="dashboard-welcome">

                <div>
                  <span>
                    Good morning
                  </span>

                  <h4>
                    Your cycle overview
                  </h4>
                </div>

                <span className="dashboard-status">
                  On track
                </span>

              </div>

              {/* MAIN STATS */}

              <div className="dashboard-stats">

                <div className="dashboard-stat dashboard-stat-main">

                  <span>
                    NEXT PERIOD
                  </span>

                  <strong>
                    4
                  </strong>

                  <small>
                    days
                  </small>

                  <p>
                    Expected around Sep 15
                  </p>

                  <div className="dashboard-progress">
                    <span></span>
                  </div>

                </div>

                <div className="dashboard-stat">

                  <span>
                    CYCLE DAY
                  </span>

                  <strong>
                    24
                  </strong>

                  <p>
                    of your current cycle
                  </p>

                </div>

                <div className="dashboard-stat">

                  <span>
                    LAST PERIOD
                  </span>

                  <strong>
                    Aug 18
                  </strong>

                  <p>
                    Start date recorded
                  </p>

                </div>

              </div>

              {/* CALENDAR */}

              <div className="dashboard-calendar">

                <div className="dashboard-calendar-header">

                  <strong>
                    September 2026
                  </strong>

                  <CalendarDays
                    size={15}
                    strokeWidth={1.7}
                  />

                </div>

                <div className="dashboard-week">

                  <span>M</span>
                  <span>T</span>
                  <span>W</span>
                  <span>T</span>
                  <span>F</span>
                  <span>S</span>
                  <span>S</span>

                </div>

                <div className="dashboard-days">

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

                  <span className="dashboard-today">
                    11
                  </span>

                  <span>12</span>
                  <span>13</span>

                  <span>14</span>

                  <span className="dashboard-period">
                    15
                  </span>

                  <span>16</span>
                  <span>17</span>
                  <span>18</span>
                  <span>19</span>
                  <span>20</span>

                  <span>21</span>
                  <span>22</span>
                  <span>23</span>
                  <span>24</span>
                  <span>25</span>
                  <span>26</span>
                  <span>27</span>

                </div>

              </div>

              {/* REMINDER */}

              <div className="dashboard-reminder">

                <div className="dashboard-reminder-icon">
                  <Bell
                    size={16}
                    strokeWidth={1.7}
                  />
                </div>

                <div>

                  <span>
                    UPCOMING REMINDER
                  </span>

                  <strong>
                    Your period may be approaching.
                  </strong>

                  <p>
                    Scheduled for Sep 12
                  </p>

                </div>

                <CheckCircle2
                  className="dashboard-check"
                  size={18}
                  strokeWidth={1.7}
                />

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default ProductPreview;