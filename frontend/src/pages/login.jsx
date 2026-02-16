/**
 * @fileoverview Login page component using Clerk authentication.
 * @author EXACTUM-dev
 * @version 1.0.3
 */
import React, { useEffect, useState, useRef } from "react";
import { SignIn, SignUp, useUser, useClerk } from "@clerk/clerk-react";
import {
  Navigate,
  useSearchParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { sendLoginErrorLog } from "../services/loginLogs.service.js";
import MembershipInfoModal from "../overviewPage/membershipInfoModal";

/**
 * Login page component that handles user authentication via Clerk.
 * Supports both sign-in and sign-up modes for OAuth providers.
 * Uses URL parameter ?mode=signup to switch between modes.
 *
 * @return {React.Element} The rendered login page component.
 */
export default function LoginPage() {
  const { isSignedIn, isLoaded } = useUser();
  const clerk = useClerk();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "signin";
  const [showMembershipModal, setShowMembershipModal] = useState(false);

  useEffect(() => {
    if (!clerk) return;
    if (mode === "signup" && searchParams.get("fromMembership") === "1") {
      setShowMembershipModal(true);
    }
    // Broad listener: some Clerk event names vary by version.
    // Capture any event containing 'sign' or 'failed' and any payload with an `error` object.
    const removeListener = clerk.addListener(({ event, payload }) => {
      try {
        const isFailureEvent =
          typeof event === "string" &&
          (event.toLowerCase().includes("failed") ||
            event.toLowerCase().includes("sign"));

        const hasErrorPayload =
          payload && (payload.error || payload?.status === "failed");

        if (isFailureEvent || hasErrorPayload) {
          const identifier =
            payload?.attempt?.identifier ||
            payload?.emailAddress ||
            payload?.identifier ||
            payload?.externalEmail ||
            null;

          // Build `detalles` including raw payload for debugging (sanitized server-side)
          const detalles = {
            rawEvent: event,
            payload: payload,
          };

          sendLoginErrorLog({
            usuario: identifier,
            codigoError:
              payload?.error?.code || payload?.code || "CLERK_SIGNIN_FAILED",
            mensajeError:
              payload?.error?.message ||
              payload?.message ||
              "Intento fallido de inicio de sesión",
            detalles,
          });
        }
      } catch (err) {
        // Do not break the UI if handling fails
      }
    });

    // Global error capture: catch JS errors and unhandled promise rejections
    const onWindowError = (event) => {
      try {
        sendLoginErrorLog({
          usuario: null,
          codigoError: "FRONTEND_ERROR",
          mensajeError: event?.message || "Window error captured",
          detalles: {
            filename: event?.filename,
            lineno: event?.lineno,
            colno: event?.colno,
            error: event?.error,
          },
        });
      } catch { }
    };

    const onUnhandledRejection = (ev) => {
      try {
        sendLoginErrorLog({
          usuario: null,
          codigoError: "UNHANDLED_REJECTION",
          mensajeError:
            (ev && ev.reason && ev.reason.message) ||
            "Unhandled promise rejection",
          detalles: { reason: ev?.reason },
        });
      } catch { }
    };

    window.addEventListener("error", onWindowError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      if (typeof removeListener === "function") {
        removeListener();
      }
      window.removeEventListener("error", onWindowError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, [clerk, mode, searchParams]);

  // MutationObserver to detect visible messages inside the widget (e.g. "External Account was not found")
  const signContainerRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const node = signContainerRef.current;
    if (!node) return;

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        const added = Array.from(m.addedNodes || []);
        for (const n of added) {
          try {
            const text = n.textContent || "";
            // Check specifically for "External account not found" or similar messages
            // Clerk often uses "external_account_not_found" code, but in UI it shows text.
            // We'll check for the text message.
            if (
              text &&
              /external account|account was not found|no encontrado/i.test(text)
            ) {
              // Extract the provider strategy if possible, or retry the last strategy
              // Since we are in the SignIn component, we might not have the strategy directly. 
              // However, if the user clicked a social button, Clerk's client might have the state.
              // A common pattern for auto-registration is to just switch to SignUp mode 
              // but we want to *automatically* authenticate if possible.

              // Attempt to find which strategy was used. 
              // If we can't find it, we at least switch to Sign Up mode.

              console.log("External account not found - attempting auto-registration");

              // We can try to get the last attempt from Clerk client if available
              // or just redirect to sign-up. 
              // For a seamless flow, we try to SignUp with the same provider.

              // NOTE: This relies on the user verifying the account again or the provider 
              // sharing the info.

              // Let's try to switch to SignUp mode with the same provider if valid.
              // If we can't determine the provider easily from the DOM, we might need 
              // to rely on the user clicking the button again, OR we can try to 
              // infer it from the error or previous interaction.

              // SIMPLIFICATION: 
              // 1. Log the error (keep existing logic)
              sendLoginErrorLog({
                usuario: null,
                codigoError: "CLERK_UI_MESSAGE",
                mensajeError: text.trim().slice(0, 1000),
                detalles: { source: "mutation-observer", action: "auto-signup-redirect" },
              });

              // 2. Redirect to SignUp. 
              // Ideally we would trigger the specific provider, but without keeping track of 
              // which button was clicked, we can't know for sure.
              // However, we can switch the mode to 'signup' which will render the SignUp component.
              // The user will have to click the provider button again, which is a safer default 
              // than guessing. 

              // BUT the requirements say "haga el registro automatico". 
              // To do this, we need to know the strategy. 
              // We can store the last clicked strategy in sessionStorage/state when a user clicks a button.
              // Let's add that listener first.

              const lastStrategy = sessionStorage.getItem("clerk_last_strategy");
              if (lastStrategy) {
                // Clean up
                sessionStorage.removeItem("clerk_last_strategy");

                // Trigger SignUp with that strategy
                if (clerk && clerk.client && clerk.client.signUp) {
                  clerk.client.signUp.authenticateWithRedirect({
                    strategy: lastStrategy,
                    redirectUrl: "/sso-callback",
                    signInUrl: "/login?mode=signin",
                  }).catch(err => console.error("Auto-signup failed", err));
                  return;
                }
              }

              // Fallback: just switch to signup mode
              navigate("/login?mode=signup", { replace: true });
            }
          } catch (err) {
            // ignore
          }
        }
      }
    });

    observer.observe(node, { childList: true, subtree: true });

    // Add click listeners to social buttons to capture strategy
    // We delegate this to the container since buttons might render later
    const handleSocialClick = (e) => {
      // traverse up to find the button
      let el = e.target;
      while (el && el !== node) {
        if (el.tagName === 'BUTTON') {
          // Try to guess strategy from text or class
          // This is hacky but Clerk's buttons usually have identifiable text
          const txt = el.textContent.toLowerCase();
          let strategy = null;
          if (txt.includes('google')) strategy = 'oauth_google';
          else if (txt.includes('facebook')) strategy = 'oauth_facebook';
          else if (txt.includes('github')) strategy = 'oauth_github';
          // Add others as needed

          if (strategy) {
            sessionStorage.setItem("clerk_last_strategy", strategy);
          }
          break;
        }
        el = el.parentElement;
      }
    };

    node.addEventListener('click', handleSocialClick);

    return () => {
      observer.disconnect();
      node.removeEventListener('click', handleSocialClick);
    };
  }, [signContainerRef.current, clerk, navigate]);
  useEffect(() => {
    try {
      const hash = location && location.hash ? location.hash : "";
      if (!hash) return;
      if (hash.includes("mode=")) {
        navigate(location.pathname || "/login", { replace: true });
      }
    } catch (err) { }
  }, [location, navigate]);

  // Display loading state while authentication status is being determined
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
            style={{ borderBottomColor: "#CAD00F" }}
          ></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Redirect authenticated users to home page
  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }

  // Display login form for unauthenticated users
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <MembershipInfoModal
        open={showMembershipModal}
        onClose={() => setShowMembershipModal(false)}
        highlightStep={2}
      />
      <div className="flex flex-col items-center w-full max-w-md">
        {/* Logo/Avatar */}
        <div className="flex justify-center mb-[-40px] sm:mb-[-40px] lg:mb-[-30px] z-10">
          <img
            src="/SOMEFIPPlogo.png"
            alt="Logo"
            className="w-20 h-20 rounded-full border-4 border-white shadow-lg bg-white"
          />
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 pt-16 w-full">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-1">
              Bienvenido a la SOMEFIPP
            </h2>
          </div>

          <div ref={signContainerRef} className="flex justify-center">
            {mode === "signin" ? (
              <SignIn
                path="/login"
                routing="path"
                signUpUrl="/login?mode=signup"
                afterSignInUrl="/"
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "shadow-none w-full",
                    formButtonPrimary:
                      "bg-black hover:bg-gray-800 text-white rounded-md py-2",
                    socialButtonsBlockButton:
                      "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300",
                    formFieldInput: "border-gray-300 rounded-md",
                    formFieldLabel: "text-gray-700 font-medium",
                    footer: "hidden",
                  },
                }}
              />
            ) : (
              <SignUp
                path="/login"
                routing="path"
                signInUrl="/login?mode=signin"
                afterSignUpUrl="/"
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "shadow-none w-full",
                    formButtonPrimary:
                      "bg-black hover:bg-gray-800 text-white rounded-md py-2",
                    socialButtonsBlockButton:
                      "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300",
                    formFieldInput: "border-gray-300 rounded-md",
                    formFieldLabel: "text-gray-700 font-medium",
                    footer: "hidden",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                  },
                }}
              />
            )}
          </div>
        </div>

        {/* Additional Links */}
        <div className="mt-6 text-center text-sm text-gray-600 space-y-2 px-4">
          <p>
            ¿No tienes cuenta?{" "}
            <a
              href="/solicitud-membresia"
              className="text-[#CAD00F] hover:text-[#b8bd0d] font-medium transition-colors"
            >
              Solicita tu membresía
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
