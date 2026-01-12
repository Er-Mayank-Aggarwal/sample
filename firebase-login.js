// firebase-login.js (Firebase v9+ modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

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
  const phone = document.getElementById("phone-number").value.trim();
  const phoneNumber = "+91" + phone;

  console.log("Sending OTP to:", phoneNumber);

  if (!/^\+91\d{10}$/.test(phoneNumber)) {
    document.getElementById("otp-message").textContent =
      "Enter a valid 10-digit phone number";
    setGenerateOTPLoading(false);
    return;
  }

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
    window.recaptchaVerifier.render();
  }

  signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier)
    .then((result) => {
      confirmationResult = result;

      // ✅ Hide Generate OTP
      document.getElementById("generate-otp-wrapper").style.display = "none";

      // ✅ Show OTP section
      const otpSection = document.getElementById("otp-section");
      otpSection.style.display = "block";
otpSection.offsetHeight; // force reflow
otpSection.style.animation = "slideUp 0.25s ease";


      document.getElementById("otp-message").textContent = "OTP sent!";
    })
    .catch((error) => {
      console.error(error);
      document.getElementById("otp-message").textContent =
        "Failed to send OTP. Try again.";

      // 🔁 Restore button
      setGenerateOTPLoading(false);
    });
};


function resetOTPUI() {
  document.getElementById("otp-section").style.display = "none";
  document.getElementById("generate-otp-wrapper").style.display = "block";
  document.getElementById("otp-message").textContent = "";
  setGenerateOTPLoading(false);
}

document.getElementById("phone-number").addEventListener("input", resetOTPUI);
document.getElementById("user-name").addEventListener("input", resetOTPUI);


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

