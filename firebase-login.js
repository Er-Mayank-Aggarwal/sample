/* ==========================
   firebase-login.js (FIXED)
   ========================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import AuthToken from './auth-token.js';


/* =====================================
   LOGIN GUARD HELPER
===================================== */

window.requireLogin = function (onSuccess) {
  const user = window.FirebaseAuth.currentUser;

  if (user) {
    // Already logged in ✅
    onSuccess && onSuccess();
    return true;
  }

  // ❌ Not logged in → show login modal
  console.log("🔒 Login required, showing modal");

  const modal = document.getElementById("login-modal");
  if (modal) {
    modal.style.display = "flex";
  } else {
    alert("Please login to continue");
  }

  return false;
};

// 🔥 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA78LZZJSGAundFO3Uus-Eoqas4N65s5Vs",
  authDomain: "localhost",
  projectId: "listerr-network",
  storageBucket: "listerr-network.firebasestorage.app",
  messagingSenderId: "311601038241",
  appId: "1:311601038241:web:3c339441baa46b345541e0",
  measurementId: "G-FM6L3XHLTB"
};

// 🔹 Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.useDeviceLanguage();

// 🔥 VERY IMPORTANT: Persist login across pages & reloads
await setPersistence(auth, browserLocalPersistence);

// ===== GLOBAL EXPORTS =====
window.FirebaseAuth = auth;
window.RecaptchaVerifier = RecaptchaVerifier;
window.signInWithPhoneNumber = signInWithPhoneNumber;
window.confirmationResult = null;

let cachedUser = null;
let authReady = false;

/* =====================================
   AUTH STATE LISTENER (FIXED VERSION)
===================================== */

onAuthStateChanged(auth, async (user) => {
  authReady = true;
  cachedUser = user;

  if (user) {
    console.log("✅ User logged in:", user.uid);
    // Do NOT set AuthToken or localStorage here. Only backend API token should be used for app auth.
  } else {
    // Firebase takes time to restore session on page load
    console.log("⏳ Firebase restoring session... keeping existing token");
  }
});


/* =====================================
   HELPER: ALWAYS GET LATEST TOKEN
===================================== */

window.getAuthToken = async function () {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken(true);
    // Do NOT set AuthToken here. Only backend API token should be used for app auth.
    return token;
  }
  // fallback from storage
  return AuthToken.get();
};


/* ================= OTP SEND ================= */

let recaptchaInitialized = false;

window.sendOTP = async function (callback) {
  const phoneInput = document.getElementById("phone-number");
  const otpMsg = document.getElementById("otp-message");

  if (!phoneInput) {
    otpMsg.textContent = "Phone input not found";
    callback && callback(false);
    return;
  }

  const phoneNumber = phoneInput.value.trim();
  console.log("📨 Sending OTP to:", phoneNumber);

  if (!/^\+\d{8,15}$/.test(phoneNumber)) {
    otpMsg.textContent = "Enter a valid phone number with country code";
    callback && callback(false);
    return;
  }

  try {
    // 🔥 Create reCAPTCHA only once
    if (!recaptchaInitialized) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        { size: "invisible" },
        auth
      );

      await window.recaptchaVerifier.render();
      recaptchaInitialized = true;
      console.log("🤖 reCAPTCHA rendered once ✔️");
    }

    // 🔹 Send OTP
    const result = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      window.recaptchaVerifier
    );

    window.confirmationResult = result;
    console.log("📩 OTP sent successfully");

    otpMsg.textContent = "OTP sent!";
    callback && callback(true);

  } catch (error) {
    console.error("❌ OTP ERROR:", error);
    otpMsg.textContent = error.message || "Failed to send OTP.";
    callback && callback(false);
  }
};
