// firebase-login.js (Firebase v9+ modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA78LZZJSGAundFO3Uus-Eoqas4N65s5Vs",
  authDomain: "localhost",
  projectId: "listerr-network",
  storageBucket: "listerr-network.firebasestorage.app",
  messagingSenderId: "311601038241",
  appId: "1:311601038241:web:3c339441baa46b345541e0",
  measurementId: "G-FM6L3XHLTB"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.useDeviceLanguage();

// ==========================================
// 1. EXPOSE AUTH GLOBALLY (Required for SSO)
// ==========================================
window.FirebaseAuth = auth;
window.FirebaseListener = onAuthStateChanged;
window.FirebaseSignOut = signOut;

let confirmationResult = null;
let authReady = false;
let cachedUser = null;

// ==========================================
// 2. AUTH STATE LISTENER
// ==========================================
onAuthStateChanged(auth, (user) => {
  cachedUser = user;
  authReady = true;

  if (user) {
    console.log("Global Auth: User Logged In:", user.uid);
    // If we are on the cart page and just logged in via modal, 
    // we might want to auto-redirect or just let the user click checkout again.
  } else {
    console.log("Global Auth: User Logged Out");
  }
});

window.getCurrentUser = function () {
  return authReady ? cachedUser : null;
};

window.logout = function () {
    signOut(auth).then(() => {
        console.log("Signed out successfully");
        location.reload(); // Reload page to reset UI
    }).catch((error) => {
        console.error("Sign out error", error);
    });
};

/* ---------------- UI HELPERS ---------------- */

window.setGenerateOTPLoading = function (isLoading) {
  const btn = document.getElementById("generate-otp-btn");
  if (!btn) return;

  if (isLoading) {
    btn.disabled = true;
    btn.textContent = "SENDING…";
    btn.style.opacity = "0.7";
  } else {
    btn.disabled = false;
    btn.textContent = "GENERATE OTP";
    btn.style.opacity = "1";
  }
}

window.showLoginModal = function () {
  const modal = document.getElementById("login-modal");
  if(modal) {
      modal.style.display = "flex";
      // Reset UI state when opening
      const otpSection = document.getElementById("otp-section");
      const otpWrapper = document.getElementById("generate-otp-wrapper");
      const otpMsg = document.getElementById("otp-message");
      
      if(otpSection) otpSection.style.display = "none";
      if(otpWrapper) otpWrapper.style.display = "block";
      if(otpMsg) otpMsg.textContent = "";
  }
};

window.hideLoginModal = function (e) {
  // If triggered by click event, check if clicked outside card
  if (e && e.target !== e.currentTarget) return;
  
  const modal = document.getElementById("login-modal");
  if(modal) modal.style.display = "none";
};

/* ---------------- CHECKOUT HANDLER ---------------- */

window.checkoutHandler = function (e) {
  if (e) e.preventDefault();

  if (!authReady) {
    console.log("Auth not ready, waiting...");
    // Simple retry
    setTimeout(() => window.checkoutHandler(e), 200);
    return;
  }

  if (cachedUser) {
    // Logged in -> Go to Shipping
    window.location.href = "shipping.html";
  } else {
    // Not Logged in -> Show Modal
    window.showLoginModal();
  }
};


/* ---------------- OTP LOGIC ---------------- */

window.sendOTP = function () {
  const phoneInput = document.getElementById("phone-number");
  if(!phoneInput) return;

  const phone = phoneInput.value.trim();
  const phoneNumber = "+91" + phone;

  console.log("Sending OTP to:", phoneNumber);

  const otpMsg = document.getElementById("otp-message");

  if (!/^\+91\d{10}$/.test(phoneNumber)) {
    if(otpMsg) otpMsg.textContent = "Enter a valid 10-digit phone number";
    window.setGenerateOTPLoading(false);
    return;
  }

  // Recaptcha Setup
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      "recaptcha-container",
      {
        size: "invisible",
        callback: () => {
          console.log("reCAPTCHA solved");
        }
      },
      auth
    );
  }

  signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier)
    .then((result) => {
      confirmationResult = result;

      // Update UI
      const genWrapper = document.getElementById("generate-otp-wrapper");
      const otpSection = document.getElementById("otp-section");
      
      if(genWrapper) genWrapper.style.display = "none";
      if(otpSection) {
          otpSection.style.display = "block";
          otpSection.offsetHeight; // force reflow
          otpSection.style.animation = "slideUp 0.25s ease";
      }
      if(otpMsg) otpMsg.textContent = "OTP sent!";
      
      window.setGenerateOTPLoading(false);
    })
    .catch((error) => {
      console.error(error);
      if(otpMsg) otpMsg.textContent = "Failed to send OTP. Try again.";
      window.setGenerateOTPLoading(false);
      
      // Reset Recaptcha if failed
      if(window.recaptchaVerifier) {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
      }
    });
};

function resetOTPUI() {
  const otpSection = document.getElementById("otp-section");
  const genWrapper = document.getElementById("generate-otp-wrapper");
  const otpMsg = document.getElementById("otp-message");

  if(otpSection) otpSection.style.display = "none";
  if(genWrapper) genWrapper.style.display = "block";
  if(otpMsg) otpMsg.textContent = "";
  window.setGenerateOTPLoading(false);
}

// Safely add listeners if elements exist
const pInput = document.getElementById("phone-number");
const nInput = document.getElementById("user-name");
if(pInput) pInput.addEventListener("input", resetOTPUI);
if(nInput) nInput.addEventListener("input", resetOTPUI);


window.verifyOTP = function () {
  const codeInput = document.getElementById("otp-code");
  if(!codeInput) return;
  
  const code = codeInput.value.trim();
  const otpMsg = document.getElementById("otp-message");

  if (!confirmationResult) {
    if(otpMsg) otpMsg.textContent = "Please request OTP first.";
    return;
  }

  confirmationResult
    .confirm(code)
    .then((result) => {
      console.log("Logged in successfully:", result.user.uid);
      
      // Hide Modal
      window.hideLoginModal();
      
      // If we are on shipping page, this might trigger a reload via listener, 
      // but if we are on Cart page, we check if we need to redirect.
      
      // If a callback exists (e.g. from index.html)
      if(window.onLoginSuccess) {
          window.onLoginSuccess(result.user);
      } else if (window.location.pathname.includes('cart.html')) {
          // If in cart, assume user wanted to checkout
          window.location.href = "shipping.html";
      }
      
    })
    .catch((error) => {
      console.error(error);
      if(otpMsg) otpMsg.textContent = "Invalid OTP. Try again.";
    });
};