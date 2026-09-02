function MailIcon({ size = 15 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M3.5 7L12 13L20.5 7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


function LinkedinIcon({ size = 15 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M8 10V16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <circle
        cx="8"
        cy="7.5"
        r="1"
        fill="currentColor"
      />

      <path
        d="M12 16V10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M12 13C12 11.35 13.05 10 14.5 10C15.95 10 17 11.15 17 13V16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}


function ArrowIcon({ size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M5 19L19 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M9 5H19V15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  const scrollToSection = (id) => {
    const section = document.getElementById(id);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };


  const handleTermsClick = (event) => {
    event.preventDefault();
  };


  return (
    <footer className="footer">
      <div className="footer-container">

        {/* =================================================
            FOOTER TOP
        ================================================= */}

        <div className="footer-top">

          {/* =================================================
              BRAND
          ================================================= */}

          <div className="footer-brand">

            <button
              type="button"
              className="footer-logo"
              onClick={scrollToTop}
              aria-label="Back to top"
            >
              <span>
                C
              </span>

              <strong>
                CycleCare
              </strong>
            </button>


            <p>
              A simpler way to understand your cycle,
              prepare ahead, and make space for your
              wellbeing.
            </p>


            {/* SOCIAL / CONTACT */}

            <div className="footer-socials">

              <a
                href="https://www.linkedin.com/in/mohammad-abdullah-9266623ab/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Mohammad Abdullah on LinkedIn"
              >
                <LinkedinIcon size={15} />
              </a>


              <a
                href="mailto:mohdabdullahsheikh36@gmail.com"
                aria-label="Email Mohammad Abdullah"
              >
                <MailIcon size={15} />
              </a>

            </div>

          </div>


          {/* =================================================
              PRODUCT
          ================================================= */}

          <div className="footer-column">

            <h3>
              Product
            </h3>


            <button
              type="button"
              onClick={() =>
                scrollToSection("how-it-works")
              }
            >
              How It Works
            </button>


            <button
              type="button"
              onClick={() =>
                scrollToSection("product-preview")
              }
            >
              Product
            </button>


            <button
              type="button"
              onClick={() =>
                scrollToSection("features")
              }
            >
              Features
            </button>


            <button
              type="button"
              onClick={() =>
                scrollToSection("wellness")
              }
            >
              Wellness
            </button>

          </div>


          {/* =================================================
              COMPANY
          ================================================= */}

          <div className="footer-column">

            <h3>
              Company
            </h3>


            <button
              type="button"
              onClick={() =>
                scrollToSection("why-cyclecare")
              }
            >
              About CycleCare
            </button>


            <button
              type="button"
              onClick={() =>
                scrollToSection("privacy")
              }
            >
              Privacy
            </button>


            <button
              type="button"
              onClick={() =>
                scrollToSection("get-started")
              }
            >
              Get Started
            </button>

          </div>


          {/* =================================================
              SUPPORT
          ================================================= */}

          <div className="footer-column">

            <h3>
              Support
            </h3>


            <a
              href="mailto:mohdabdullahsheikh36@gmail.com"
            >
              Contact us
            </a>


            <a
              href="mailto:mohdabdullahsheikh36@gmail.com"
            >
              Help &amp; Support
            </a>


            <button
              type="button"
              onClick={() =>
                scrollToSection("privacy")
              }
            >
              Privacy Policy
            </button>


            <a
              href="#"
              onClick={handleTermsClick}
            >
              Terms of Use
            </a>

          </div>

        </div>


        {/* =================================================
            DEVELOPER / CONTACT
        ================================================= */}

        <div className="footer-developer">

          <div className="footer-developer-copy">

            <span>
              DESIGNED &amp; DEVELOPED BY
            </span>


            <strong>
              Mohammad Abdullah
            </strong>


            <p>
              Full-Stack Developer
            </p>

          </div>


          <div className="footer-developer-links">

            {/* EMAIL */}

            <a
              href="mailto:mohdabdullahsheikh36@gmail.com"
              className="footer-contact-link"
            >
              <MailIcon size={14} />

              <span>
                mohdabdullahsheikh36@gmail.com
              </span>
            </a>


            {/* LINKEDIN */}

            <a
              href="https://www.linkedin.com/in/mohammad-abdullah-9266623ab/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-contact-link"
            >
              <LinkedinIcon size={14} />

              <span>
                LinkedIn
              </span>

              <ArrowIcon size={12} />
            </a>

          </div>

        </div>


        {/* =================================================
            DISCLAIMER
        ================================================= */}

        <div className="footer-disclaimer">

          <strong>
            Important note
          </strong>


          <p>
            CycleCare is designed for cycle tracking,
            planning, and general wellness support. It is
            not intended to diagnose, treat, or prevent any
            medical condition. If you have health concerns,
            consult a qualified healthcare professional.
          </p>

        </div>


        {/* =================================================
            FOOTER BOTTOM
        ================================================= */}

        <div className="footer-bottom">

          <span>
            © 2026 CycleCare. All rights reserved.
          </span>


          <button
            type="button"
            onClick={scrollToTop}
            className="footer-back-top"
          >
            <span>
              Back to top
            </span>

            <ArrowIcon size={14} />

          </button>

        </div>

      </div>
    </footer>
  );
}


export default Footer;