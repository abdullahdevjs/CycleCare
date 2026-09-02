import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import WhyCycleCare from "./components/WhyCycleCare";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import ProductPreview from "./components/ProductPreview";
import WellnessSection from "./components/WellnessSection";
import PrivacySection from "./components/PrivacySection";
import FinalCTA from "./components/FinalCTA";
import Footer from "./components/Footer";
import SignupModal from "./components/SignupModal";
import LoginModal from "./components/LoginModal";
import SiteEnhancements from "./components/SiteEnhancements";
import Dashboard from "./pages/Dashboard";
import CycleSetup from "./pages/CycleSetup";
import HistoryInsights from "./pages/HistoryInsights";
import AccountSettings from "./pages/AccountSettings";
import { supabase } from "./lib/supabase";

function App() {
  const [signupOpen, setSignupOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [appView, setAppView] = useState("dashboard");
  const [needsSetup, setNeedsSetup] = useState(false);

  const hydrateAuthenticatedUser = async (currentSession) => {
    if (!currentSession?.user) {
      setNeedsSetup(false);
      setAppView("dashboard");
      return;
    }

    const user = currentSession.user;
    const { data, error } = await supabase
      .from("cycle_profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Cycle profile bootstrap error:", error);
      setNeedsSetup(false);
      return;
    }

    setNeedsSetup(!data);
  };

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.error("Session error:", error);
      if (!mounted) return;
      setSession(data?.session ?? null);
      await hydrateAuthenticatedUser(data?.session ?? null);
      if (mounted) setAuthLoading(false);
    };

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;
        setSession(currentSession ?? null);
        setSignupOpen(false);
        setLoginOpen(false);
        if (event === "SIGNED_OUT") {
          setNeedsSetup(false);
          setAppView("dashboard");
          return;
        }
        if (currentSession?.user) await hydrateAuthenticatedUser(currentSession);
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const modalOpen = signupOpen || loginOpen;
    document.body.classList.toggle("modal-is-open", modalOpen);
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setSignupOpen(false);
        setLoginOpen(false);
      }
    };
    if (modalOpen) document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("modal-is-open");
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [signupOpen, loginOpen]);

  const openSignup = () => { setLoginOpen(false); setSignupOpen(true); };
  const openLogin = () => { setSignupOpen(false); setLoginOpen(true); };
  const scrollToHowItWorks = () => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth", block: "start" });
  const logout = async () => { await supabase.auth.signOut(); };

  if (authLoading) {
    return <div className="app-auth-loading" role="status" aria-live="polite" aria-label="Loading CycleCare">
      <div className="app-auth-loading-shell">
        <div className="app-auth-loading-brand"><div className="app-auth-loading-symbol">C</div><div><strong>CycleCare</strong><small>Your private cycle companion</small></div></div>
        <div className="app-auth-loading-line"><span/><span/><span/></div>
        <small className="app-auth-loading-copy">Securing your private workspace…</small>
      </div>
    </div>;
  }

  if (session?.user) {
    // First-time members must complete Cycle Setup before entering the
    // dashboard. Returning members go straight to the dashboard.
    if (needsSetup && appView !== "setup") {
      return <CycleSetup onComplete={() => { setNeedsSetup(false); setAppView("dashboard"); }} />;
    }
    if (appView === "setup") {
      return <CycleSetup onComplete={() => { setNeedsSetup(false); setAppView("dashboard"); }} />;
    }
    if (appView === "history") return <HistoryInsights onBack={() => setAppView("dashboard")} initialSection="cycle" />;
    if (appView === "wellness") return <HistoryInsights onBack={() => setAppView("dashboard")} initialSection="wellness" />;
    if (appView === "settings") return <AccountSettings onBack={() => setAppView("dashboard")} onLogout={logout} />;
    return <Dashboard onSetupCycle={() => setAppView("setup")} onOpenHistory={() => setAppView("history")} onOpenWellness={() => setAppView("wellness")} onOpenSettings={() => setAppView("settings")} />;
  }

  return <>
    <SiteEnhancements />
    <Navbar onGetStarted={openSignup} onLogin={openLogin} />
    <main><Hero onGetStarted={openSignup} /><WhyCycleCare onHowItWorks={scrollToHowItWorks} /><HowItWorks /><ProductPreview /><Features /><WellnessSection /><PrivacySection /><FinalCTA onGetStarted={openSignup} /></main>
    <Footer />
    {signupOpen && <SignupModal onClose={() => setSignupOpen(false)} onLogin={openLogin} />}
    {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} onSignup={openSignup} />}
  </>;
}

export default App;
