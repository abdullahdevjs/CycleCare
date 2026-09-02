import {
  ArrowRight,
  Droplets,
  Heart,
  Moon,
} from "lucide-react";

const wellnessItems = [
  {
    icon: Moon,
    title: "Make room for rest",
    description:
      "Give yourself permission to slow down when your body asks for it.",
  },
  {
    icon: Droplets,
    title: "Stay hydrated",
    description:
      "Keep water nearby and maintain a simple hydration routine throughout the day.",
  },
  {
    icon: Heart,
    title: "Listen to your body",
    description:
      "Pay attention to how you feel and make space for the care that works for you.",
  },
];

function WellnessSection() {
  const handleExplore = () => {
    const target = document.getElementById(
      "wellness-guidance"
    );

    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <section
      className="wellness-section"
      id="wellness"
      aria-labelledby="wellness-title"
    >
      <div className="wellness-container">

        {/* IMAGE SIDE */}

        <div className="wellness-image-wrapper">

          <div className="wellness-image">

            <img
              src="/wellness-image.png"
              alt="Woman taking a quiet moment for self care"
            />

            <div
              className="wellness-image-overlay"
              aria-hidden="true"
            >
              <span>
                CARE & WELLNESS
              </span>

              <strong>
                Small moments of care matter.
              </strong>
            </div>

          </div>

          {/* FLOATING ROUTINE CARD */}

          <div className="wellness-image-card">

            <div className="wellness-card-icon">
              <Heart
                size={18}
                strokeWidth={1.7}
                aria-hidden="true"
              />
            </div>

            <div>
              <span>
                YOUR ROUTINE
              </span>

              <strong>
                Take care of yourself
              </strong>
            </div>

          </div>

        </div>

        {/* CONTENT SIDE */}

        <div className="wellness-content">

          <div className="section-eyebrow">
            <span className="section-eyebrow-line" />
            CARE & WELLNESS
          </div>

          <h2 id="wellness-title">
            Because preparation
            <span>
              {" "}isn't only about dates.
            </span>
          </h2>

          <p className="wellness-intro">
            Understanding your cycle is one part of the
            picture. CycleCare also encourages simple,
            everyday habits that can help you make more
            intentional space for yourself.
          </p>

          {/* WELLNESS ITEMS */}

          <div className="wellness-list">

            {wellnessItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <article
                  className="wellness-item"
                  key={item.title}
                  style={{
                    "--wellness-index": index,
                  }}
                >

                  <div className="wellness-item-icon">
                    <Icon
                      size={19}
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                  </div>

                  <div className="wellness-item-content">

                    <h3>
                      {item.title}
                    </h3>

                    <p>
                      {item.description}
                    </p>

                  </div>

                  <span
                    className="wellness-item-arrow"
                    aria-hidden="true"
                  >
                    <ArrowRight
                      size={14}
                      strokeWidth={1.8}
                    />
                  </span>

                </article>
              );
            })}

          </div>

          {/* CTA */}

          <button
            type="button"
            className="wellness-button"
            onClick={handleExplore}
          >
            <span>
              Explore wellness guidance
            </span>

            <ArrowRight
              size={16}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </button>

        </div>

      </div>

      {/* WELLNESS GUIDANCE */}

      <div
        className="wellness-guidance-anchor"
        id="wellness-guidance"
        aria-labelledby="wellness-guidance-title"
      >
        <div className="wellness-guidance-inner">

          <div className="section-eyebrow">
            <span className="section-eyebrow-line" />
            WELLNESS GUIDANCE
          </div>

          <h3 id="wellness-guidance-title">
            Build a routine that feels right for you.
          </h3>

          <p>
            CycleCare keeps wellness guidance simple,
            practical, and easy to fit into your everyday
            routine.
          </p>

          <div className="wellness-guidance-points">

            <span>
              Gentle reminders
            </span>

            <span>
              Everyday awareness
            </span>

            <span>
              Your routine, your pace
            </span>

          </div>

        </div>
      </div>

    </section>
  );
}

export default WellnessSection;