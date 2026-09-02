import {
  CheckCircle2,
  Database,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

const privacyPoints = [
  {
    number: "01",
    icon: LockKeyhole,
    title: "Private by design",
    description:
      "Your cycle information is treated as personal data and kept within your CycleCare account.",
  },
  {
    number: "02",
    icon: Database,
    title: "You control your information",
    description:
      "Your account settings are designed to keep your information clear, accessible, and manageable.",
  },
  {
    number: "03",
    icon: ShieldCheck,
    title: "Built with care",
    description:
      "Privacy is considered throughout the product experience rather than added as an afterthought.",
  },
];

function PrivacySection() {
  return (
    <section
      className="privacy-section"
      id="privacy"
      aria-labelledby="privacy-title"
    >
      <div className="privacy-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="privacy-heading">

          <div className="privacy-heading-copy">

            <div className="section-eyebrow">
              <span className="section-eyebrow-line" />
              PRIVACY & TRUST
            </div>

            <h2 id="privacy-title">
              Your cycle is personal.
              <span>
                {" "}Your privacy should be too.
              </span>
            </h2>

          </div>

          <p>
            CycleCare is designed around the idea that
            personal cycle information deserves a thoughtful,
            transparent experience.
          </p>

        </div>


        {/* =================================================
            MAIN TRUST PANEL
        ================================================= */}

        <div className="privacy-panel">

          {/* INTRO */}

          <div className="privacy-panel-intro">

            <div className="privacy-shield">
              <ShieldCheck
                size={25}
                strokeWidth={1.6}
                aria-hidden="true"
              />
            </div>

            <span className="privacy-panel-kicker">
              OUR APPROACH
            </span>

            <h3>
              Privacy should feel simple,
              not complicated.
            </h3>

            <p>
              We want you to understand what information
              CycleCare uses and why. The product should help
              you stay informed without making your personal
              information feel out of your hands.
            </p>

          </div>


          {/* PRIVACY POINTS */}

          <div className="privacy-points">

            {privacyPoints.map((point, index) => {
              const Icon = point.icon;

              return (
                <article
                  className="privacy-point"
                  key={point.title}
                  style={{
                    "--privacy-index": index,
                  }}
                >

                  <div className="privacy-point-top">

                    <span className="privacy-point-number">
                      {point.number}
                    </span>

                    <div className="privacy-point-icon">
                      <Icon
                        size={19}
                        strokeWidth={1.7}
                        aria-hidden="true"
                      />
                    </div>

                  </div>

                  <div className="privacy-point-content">

                    <h4>
                      {point.title}
                    </h4>

                    <p>
                      {point.description}
                    </p>

                  </div>

                  <div
                    className="privacy-check"
                    aria-hidden="true"
                  >
                    <CheckCircle2
                      size={17}
                      strokeWidth={1.7}
                    />
                  </div>

                </article>
              );
            })}

          </div>

        </div>


        {/* =================================================
            FOOTNOTE
        ================================================= */}

        <div className="privacy-note">

          <div className="privacy-note-copy">

            <span>
              A clear approach to personal information.
            </span>

            <strong>
              You should always know what you're sharing.
            </strong>

          </div>

          <div
            className="privacy-note-mark"
            aria-hidden="true"
          >
            <ShieldCheck
              size={17}
              strokeWidth={1.7}
            />
          </div>

        </div>

      </div>
    </section>
  );
}

export default PrivacySection;