import {
  ArrowRight,
  CalendarDays,
  CircleCheck,
  Sparkles,
} from "lucide-react";

const stories = [
  {
    number: "01",
    icon: CalendarDays,
    title: "Remembering dates shouldn't be stressful.",
    description:
      "Instead of relying on memory, notes, or scattered reminders, keep your cycle history organized in one calm and accessible place.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Know what's coming next.",
    description:
      "CycleCare uses the information you provide to estimate your upcoming period and help you understand what to expect.",
  },
  {
    number: "03",
    icon: CircleCheck,
    title: "Prepare without overthinking.",
    description:
      "Timely reminders and a clear overview help you stay prepared without adding unnecessary noise to your everyday routine.",
  },
];

function WhyCycleCare({ onHowItWorks }) {
  const handleHowItWorks = () => {
    if (onHowItWorks) {
      onHowItWorks();
    }
  };

  return (
    <section
      className="why-cyclecare"
      id="why-cyclecare"
      aria-labelledby="why-cyclecare-title"
    >
      <div className="why-cyclecare-container">

        {/* SECTION HEADER */}

        <div className="why-cyclecare-heading">

          <div className="section-eyebrow">
            <span className="section-eyebrow-line" />
            WHY CYCLECARE
          </div>

          <h2 id="why-cyclecare-title">
            Less remembering.
            <span> More feeling prepared.</span>
          </h2>

          <p>
            Your cycle should not be another thing you have
            to constantly keep in the back of your mind.
            CycleCare brings the important details together
            in one simple experience.
          </p>

        </div>

        {/* STORY CARDS */}

        <div className="why-cyclecare-content">

          {stories.map((story) => {
            const Icon = story.icon;

            return (
              <article
                className="why-cyclecare-story"
                key={story.number}
              >

                <div className="story-top">

                  <span className="story-number">
                    {story.number}
                  </span>

                  <div className="story-icon">
                    <Icon
                      size={21}
                      strokeWidth={1.7}
                    />
                  </div>

                </div>

                <div className="story-content">

                  <h3>
                    {story.title}
                  </h3>

                  <p>
                    {story.description}
                  </p>

                </div>

                <div className="story-accent" />

              </article>
            );
          })}

        </div>

        {/* BOTTOM STATEMENT */}

        <div className="why-cyclecare-bottom">

          <div className="why-cyclecare-statement">

            <span>
              A simpler approach to cycle awareness.
            </span>

            <strong>
              Designed around your routine,
              not the other way around.
            </strong>

          </div>

          <button
            type="button"
            className="why-cyclecare-link"
            onClick={handleHowItWorks}
            aria-label="See how CycleCare works"
          >
            <span>
              See how CycleCare works
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

export default WhyCycleCare;