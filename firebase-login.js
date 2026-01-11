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
  apiKey: "AIzaSyA78LZZJSGAundFO3Uus-Eoqas4N65s5Vs",
  authDomain: "listerr-network.firebaseapp.com",
  projectId: "listerr-network",
  storageBucket: "listerr-network.firebasestorage.app",
  messagingSenderId: "311601038241",
  appId: "1:311601038241:web:3c339441baa46b345541e0",
  measurementId: "G-FM6L3XHLTB"
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
  console.log("Phone number being sent:", phoneNumber);

  if (!/^\+\d{10,15}$/.test(phoneNumber)) {
    document.getElementById("otp-message").textContent =
      "Enter valid country code and phone number!";
    return;
  }

  // Setup visible reCAPTCHA if not already set
  if (!window.recaptchaVerifier) {
    const recaptchaContainer = document.getElementById('recaptcha-container');
    if (!recaptchaContainer) {
      alert('reCAPTCHA container not found. Please add <div id="recaptcha-container"></div> to your HTML.');
      return;
    }
    window.recaptchaVerifier = new RecaptchaVerifier(
      'recaptcha-container',
      {
        'size': 'normal', // visible checkbox
        'callback': (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      },
      auth
    );
    window.recaptchaVerifier.render();
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

