import {
  ArrowRight,
  BellRing,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";

const steps = [
  {
    number: "01",
    label: "TRACK",
    icon: CalendarDays,
    title: "Add your cycle details",
    description:
      "Enter your most recent period date and your usual cycle length. It only takes a moment.",
  },
  {
    number: "02",
    label: "UNDERSTAND",
    icon: CheckCircle2,
    title: "See what’s coming next",
    description:
      "CycleCare uses the information you provide to estimate when your next period may begin.",
  },
  {
    number: "03",
    label: "PREPARE",
    icon: BellRing,
    title: "Receive a timely reminder",
    description:
      "Get a gentle notification a few days before your estimated period so you have time to prepare.",
  },
];

function HowItWorks() {
  return (
    <section
      className="how-section"
      id="how-it-works"
    >
      <div className="how-container">

        {/* HEADER */}

        <div className="how-heading">

          <span className="section-eyebrow">
            HOW CYCLECARE WORKS
          </span>

          <h2>
            Three simple steps.
            <span> One calmer routine.</span>
          </h2>

          <p>
            CycleCare turns a small amount of information
            into a clearer view of what may be coming next.
          </p>

        </div>

        {/* STEPS */}

        <div className="how-flow">

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                className="how-step-wrapper"
                key={step.number}
              >

                <article className="how-step">

                  <div className="step-top">

                    <div className="step-icon">
                      <Icon
                        size={23}
                        strokeWidth={1.7}
                      />
                    </div>

                    <span className="step-number">
                      {step.number}
                    </span>

                  </div>

                  <span className="step-label">
                    {step.label}
                  </span>

                  <h3>
                    {step.title}
                  </h3>

                  <p>
                    {step.description}
                  </p>

                </article>

                {index < steps.length - 1 && (
                  <div
                    className="step-connector"
                    aria-hidden="true"
                  >
                    <span></span>

                    <ArrowRight
                      size={17}
                      strokeWidth={1.6}
                    />
                  </div>
                )}

              </div>
            );
          })}

        </div>

        {/* BOTTOM TRUST MESSAGE */}

        <div className="how-bottom">

          <div className="how-bottom-icon">
            <BellRing
              size={18}
              strokeWidth={1.7}
            />
          </div>

          <div className="how-bottom-content">

            <strong>
              Set it up once. Stay prepared.
            </strong>

            <span>
              Your reminder preferences can be updated
              whenever your routine changes.
            </span>

          </div>

        </div>

      </div>
    </section>
  );
}

export default HowItWorks;