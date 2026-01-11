// firebase-login.js (Firebase v9+ modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";


// Firebase config from environment variables (Vite style)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let confirmationResult = null;

/* ---------------- MODAL ---------------- */

window.showLoginModal = function () {
  document.getElementById("login-modal").style.display = "flex";
  document.getElementById("otp-section").style.display = "none";
  document.getElementById("otp-message").textContent = "";
};

window.hideLoginModal = function () {
  document.getElementById("login-modal").style.display = "none";
};

/* ---------------- CHECKOUT ---------------- */

window.checkoutHandler = function (e) {
  if (e) e.preventDefault();

  if (!authReady) {
    console.log("Auth not ready, waiting...");
    waitForAuthThenProceed();
    return;
  }

  proceedToCheckout();
};

function proceedToCheckout() {
  if (cachedUser) {
    window.location.href = "shipping.html";
  } else {
    window.showLoginModal();
  }
}

function waitForAuthThenProceed() {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    cachedUser = user;
    authReady = true;
    unsubscribe(); // 🔑 stop listening

    proceedToCheckout();
  });
}


/* ---------------- OTP ---------------- */

window.sendOTP = function () {
  const countryCode = document.getElementById("country-code").value.trim();
  const phone = document.getElementById("phone-number").value.trim();
  const phoneNumber = countryCode + phone;

  if (!/^\+\d{10,15}$/.test(phoneNumber)) {
    document.getElementById("otp-message").textContent =
      "Enter valid country code and phone number!";
    return;
  }

  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      "recaptcha-container",
      { size: "invisible" },
      auth
    );
  }

  signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier)
    .then((result) => {
      confirmationResult = result;
      document.getElementById("otp-section").style.display = "block";
      document.getElementById("otp-message").textContent = "OTP sent!";
    })
    .catch((error) => {
      document.getElementById("otp-message").textContent = error.message;
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    });
};

window.verifyOTP = function () {
  const code = document.getElementById("otp-code").value.trim();

  if (!confirmationResult) {
    document.getElementById("otp-message").textContent =
      "Please request OTP first.";
    return;
  }

  confirmationResult
    .confirm(code)
    .then((result) => {
      console.log("Logged in:", result.user.uid);
      window.hideLoginModal();
      window.location.href = "shipping.html";
    })
    .catch(() => {
      document.getElementById("otp-message").textContent =
        "Invalid OTP. Try again.";
    });
};

let authReady = false;
let cachedUser = null;

onAuthStateChanged(auth, (user) => {
  cachedUser = user;
  authReady = true;

  if (user) {
    console.log("Auth restored:", user.uid);
  } else {
    console.log("No user logged in");
  }
});
window.getCurrentUser = function () {
  return authReady ? cachedUser : null;
};
