import {
  ArrowRight,
  Bell,
  CalendarDays,
  ChartNoAxesCombined,
  LockKeyhole,
} from "lucide-react";

const features = [
  {
    number: "01",
    icon: CalendarDays,
    title: "Simple cycle tracking",
    description:
      "Keep your period history organized and easy to understand without unnecessary complexity.",
  },
  {
    number: "02",
    icon: Bell,
    title: "Timely reminders",
    description:
      "Choose when you want a gentle reminder before your estimated period so you have time to prepare.",
  },
  {
    number: "03",
    icon: ChartNoAxesCombined,
    title: "Clear cycle insights",
    description:
      "See your cycle information in a simple overview that helps you understand your personal pattern.",
  },
  {
    number: "04",
    icon: LockKeyhole,
    title: "Privacy-focused",
    description:
      "Your cycle information is personal. CycleCare is designed with privacy and control at the center.",
  },
];

function Features() {
  const scrollToWellness = () => {
    const section = document.getElementById("wellness");

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <section
      className="features-section"
      id="features"
      aria-labelledby="features-title"
    >
      <div className="features-container">

        {/* HEADER */}

        <div className="features-heading">

          <div className="features-heading-copy">

            <div className="section-eyebrow">
              <span className="section-eyebrow-line" />
              WHAT YOU GET
            </div>

            <h2 id="features-title">
              Built around what
              <span> actually matters.</span>
            </h2>

          </div>

          <p>
            CycleCare keeps the experience focused on the
            essentials: understanding your cycle, preparing
            ahead, and keeping your information under your
            control.
          </p>

        </div>

        {/* FEATURE GRID */}

        <div className="features-grid">

          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <article
                className="feature-card"
                key={feature.number}
                style={{
                  "--feature-index": index,
                }}
              >

                <div className="feature-card-top">

                  <div className="feature-icon">
                    <Icon
                      size={21}
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                  </div>

                  <span className="feature-number">
                    {feature.number}
                  </span>

                </div>

                <div className="feature-card-content">

                  <h3>
                    {feature.title}
                  </h3>

                  <p>
                    {feature.description}
                  </p>

                </div>

                <div
                  className="feature-card-line"
                  aria-hidden="true"
                >
                  <span />
                </div>

              </article>
            );
          })}

        </div>

        {/* BOTTOM MESSAGE */}

        <div className="features-bottom">

          <div className="features-bottom-copy">

            <span>
              Designed to stay simple.
            </span>

            <strong>
              Helpful when you need it.
              Quiet when you don't.
            </strong>

          </div>

          <button
            type="button"
            className="features-link"
            onClick={scrollToWellness}
          >
            <span>
              Explore the wellness experience
            </span>

            <ArrowRight
              size={16}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </button>

        </div>

      </div>
    </section>
  );
}

export default Features;