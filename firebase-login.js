/* ==========================
   firebase-login.js (FULL)
   ========================== */

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

// ===== GLOBAL EXPORTS =====
window.FirebaseAuth = auth;
window.RecaptchaVerifier = RecaptchaVerifier;
window.signInWithPhoneNumber = signInWithPhoneNumber;
window.confirmationResult = null;

let cachedUser = null;
let authReady = false;

// AUTH STATE LISTENER
onAuthStateChanged(auth, (user) => {
  cachedUser = user;
  authReady = true;

  if (user) {
    console.log("User logged in:", user.uid);
  } else {
    console.log("User logged out");
  }
});

window.logout = function () {
  signOut(auth).then(() => {
    location.reload();
  });
};

// CHECKOUT HANDLER
window.checkoutHandler = function (e) {
  if (e) e.preventDefault();

  if (!authReady) {
    setTimeout(() => window.checkoutHandler(e), 200);
    return;
  }

  if (cachedUser) {
    window.location.href = "shipping.html";
  } else {
    const modal = document.getElementById("login-modal");
    if (modal) modal.style.display = "flex";
  }
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
  console.log("Sending OTP to:", phoneNumber);

  if (!/^\+\d{8,15}$/.test(phoneNumber)) {
    otpMsg.textContent = "Enter a valid phone number";
    callback && callback(false);
    return;
  }

  try {
    // 🔥 CREATE RECAPTCHA ONLY ONCE
    if (!recaptchaInitialized) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        { size: "invisible" },
        auth
      );

      await window.recaptchaVerifier.render();
      recaptchaInitialized = true;
      console.log("reCAPTCHA rendered once ✔️");
    }

    // 🔹 JUST REUSE SAME VERIFIER FOR RESEND
    const result = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      window.recaptchaVerifier
    );

    window.confirmationResult = result;
    console.log("OTP sent successfully");

    otpMsg.textContent = "OTP sent!";
    callback && callback(true);

  } catch (error) {
    console.error("OTP ERROR:", error);
    otpMsg.textContent = error.message || "Failed to send OTP.";
    callback && callback(false);
  }
};

