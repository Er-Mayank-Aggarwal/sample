// Phone input helper for Firebase phone auth
function setFirebasePhoneInput(code, phone) {
  let phoneInput = document.getElementById('phone-number');
  if (!phoneInput) {
    phoneInput = document.createElement('input');
    phoneInput.type = 'hidden';
    phoneInput.id = 'phone-number';
    document.body.appendChild(phoneInput);
  }
  phoneInput.value = code + phone;
}
window.setFirebasePhoneInput = setFirebasePhoneInput;
