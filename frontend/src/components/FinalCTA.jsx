import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

function FinalCTA({ onGetStarted }) {
  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    }
  };

  return (
    <section
      className="final-cta-section"
      id="get-started"
      aria-labelledby="final-cta-title"
    >
      <div className="final-cta-container">

        {/* =================================================
            MAIN CTA CONTENT
        ================================================= */}

        <div className="final-cta-content">

          <div className="final-cta-eyebrow">
            <span className="final-cta-eyebrow-line" />

            START WITH CYCLECARE
          </div>


          <h2 id="final-cta-title">
            A clearer way to
            <span> stay prepared.</span>
          </h2>


          <p>
            Start tracking your cycle, understand what may
            be coming next, and build a routine that works
            for you.
          </p>


          {/* CTA */}

          <button
            type="button"
            className="final-cta-button"
            onClick={handleGetStarted}
            aria-label="Get started with CycleCare"
          >
            <span>
              Get Started Free
            </span>

            <ArrowRight
              size={17}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </button>


          {/* TRUST */}

          <div className="final-cta-trust">

            <div className="final-cta-trust-item">

              <span className="final-cta-trust-icon">
                <CheckCircle2
                  size={15}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
              </span>

              <span>
                Simple to get started
              </span>

            </div>


            <div className="final-cta-trust-item">

              <span className="final-cta-trust-icon">
                <ShieldCheck
                  size={15}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
              </span>

              <span>
                Privacy-conscious design
              </span>

            </div>

          </div>

        </div>


        {/* =================================================
            BRAND SIDE
        ================================================= */}

        <div className="final-cta-side">

          <div
            className="final-cta-mark"
            aria-hidden="true"
          >
            C
          </div>

          <span className="final-cta-brand">
            CYCLECARE
          </span>

          <p>
            Track thoughtfully.
            <br />
            Prepare confidently.
          </p>


          <div
            className="final-cta-side-line"
            aria-hidden="true"
          />

        </div>

      </div>
    </section>
  );
}

export default FinalCTA;