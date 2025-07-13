import { verifyOTP, sendEmailOTP, sendSmsOTP } from 'auth.js';

const urlParams = new URLSearchParams(window.location.search);
const email = urlParams.get('email');
const phone = urlParams.get('phone');

document.getElementById('otp-message').textContent = 
  phone ? OTP sent to ${phone} : OTP sent to ${email};

// Verify OTP
document.getElementById('otp-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const otp = document.getElementById('otp-code').value;

  const { success, error } = verifyOTP(email || phone, otp);
  if (!success) {
    alert(error || "Invalid OTP");
    return;
  }

  // Proceed to dashboard
  window.location.href = 'dashboard.html';
});

// Resend OTP
document.getElementById('resend-otp').addEventListener('click', async () => {
  if (phone) await sendSmsOTP(phone);
  else if (email) await sendEmailOTP(email);
  alert("New OTP sent!");
});