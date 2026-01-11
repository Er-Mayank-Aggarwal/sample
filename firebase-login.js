// firebase-login.js (Firebase v9+ modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB55hRSiivIVvQpBsvgDvjK3_gYpCxdLOo",
  authDomain: "listerr-63fe3.firebaseapp.com",
  projectId: "listerr-63fe3",
  storageBucket: "listerr-63fe3.firebasestorage.app",
  messagingSenderId: "331250194228",
  appId: "1:331250194228:web:66889b3ecfef58d110f761",
  measurementId: "G-1CBY9KKR9X"
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
