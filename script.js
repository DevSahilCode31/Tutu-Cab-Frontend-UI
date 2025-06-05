// DOM Elements
const loginBtn = document.getElementById("loginBtn")
const logoutBtn = document.getElementById("logoutBtn")
const loginModal = document.getElementById("loginModal")
const signupModal = document.getElementById("signupModal")
const successAnimation = document.getElementById("successAnimation")
const welcomeMessage = document.getElementById("welcomeMessage")
const userName = document.getElementById("userName")

// Forms
const loginForm = document.getElementById("loginForm")
const signupForm = document.getElementById("signupForm")

// Modal controls
const showSignup = document.getElementById("showSignup")
const showLogin = document.getElementById("showLogin")
const closeBtns = document.querySelectorAll(".close")

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  checkUserSession()
  initializeEventListeners()
  startTestimonialSlider()
})

// Event Listeners
function initializeEventListeners() {
  // Auth buttons
  loginBtn.addEventListener("click", () => openModal(loginModal))
  logoutBtn.addEventListener("click", logout)

  // Modal controls
  showSignup.addEventListener("click", (e) => {
    e.preventDefault()
    closeModal(loginModal)
    openModal(signupModal)
  })

  showLogin.addEventListener("click", (e) => {
    e.preventDefault()
    closeModal(signupModal)
    openModal(loginModal)
  })

  // Close buttons
  closeBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      closeModal(e.target.closest(".modal"))
    })
  })

  // Close modal on outside click
  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      closeModal(e.target)
    }
  })

  // Form submissions
  loginForm.addEventListener("submit", handleLogin)
  signupForm.addEventListener("submit", handleSignup)

  // Smooth scrolling for navigation
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      const targetId = link.getAttribute("href")
      const targetSection = document.querySelector(targetId)
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: "smooth" })
      }
    })
  })
}

// Modal functions
function openModal(modal) {
  modal.style.display = "block"
  document.body.style.overflow = "hidden"
}

function closeModal(modal) {
  modal.style.display = "none"
  document.body.style.overflow = "auto"
}

// Password toggle function
function togglePassword(inputId) {
  const input = document.getElementById(inputId)
  const button = input.nextElementSibling

  if (input.type === "password") {
    input.type = "text"
    button.textContent = "🙈"
  } else {
    input.type = "password"
    button.textContent = "👁"
  }
}

// Authentication functions
function handleSignup(e) {
  e.preventDefault()

  const formData = {
    name: document.getElementById("signupName").value,
    email: document.getElementById("signupEmail").value,
    mobile: document.getElementById("signupMobile").value,
    password: document.getElementById("signupPassword").value,
    confirmPassword: document.getElementById("confirmPassword").value,
  }

  // Validation
  if (!validateSignupForm(formData)) {
    return
  }

  // Check if user already exists
  const existingUsers = JSON.parse(localStorage.getItem("tutucab_users") || "[]")
  if (existingUsers.find((user) => user.email === formData.email)) {
    showError("User with this email already exists!")
    return
  }

  // Save user
  existingUsers.push({
    name: formData.name,
    email: formData.email,
    mobile: formData.mobile,
    password: formData.password,
    createdAt: new Date().toISOString(),
  })

  localStorage.setItem("tutucab_users", JSON.stringify(existingUsers))

  // Show success and redirect to login
  showSuccess("Account created successfully!", () => {
    closeModal(signupModal)
    openModal(loginModal)
    signupForm.reset()
  })
}

function handleLogin(e) {
  e.preventDefault()

  const email = document.getElementById("loginEmail").value
  const password = document.getElementById("loginPassword").value
  const rememberMe = document.getElementById("rememberMe").checked

  // Validation
  if (!validateLoginForm(email, password)) {
    return
  }

  // Check credentials
  const users = JSON.parse(localStorage.getItem("tutucab_users") || "[]")
  const user = users.find((u) => u.email === email && u.password === password)

  if (!user) {
    showError("Invalid email or password!")
    return
  }

  // Create session
  const sessionData = {
    user: user,
    loginTime: new Date().toISOString(),
    rememberMe: rememberMe,
  }

  if (rememberMe) {
    localStorage.setItem("tutucab_session", JSON.stringify(sessionData))
  } else {
    sessionStorage.setItem("tutucab_session", JSON.stringify(sessionData))
  }

  // Show success and update UI
  showSuccess("Welcome back!", () => {
    closeModal(loginModal)
    updateUIForLoggedInUser(user)
    loginForm.reset()
  })
}

function logout() {
  localStorage.removeItem("tutucab_session")
  sessionStorage.removeItem("tutucab_session")
  updateUIForLoggedOutUser()
  showSuccess("Logged out successfully!")
}

function checkUserSession() {
  const session = localStorage.getItem("tutucab_session") || sessionStorage.getItem("tutucab_session")

  if (session) {
    const sessionData = JSON.parse(session)
    updateUIForLoggedInUser(sessionData.user)
  }
}

function updateUIForLoggedInUser(user) {
  loginBtn.style.display = "none"
  logoutBtn.style.display = "block"
  userName.textContent = user.name
  welcomeMessage.style.display = "block"
}

function updateUIForLoggedOutUser() {
  loginBtn.style.display = "block"
  logoutBtn.style.display = "none"
  welcomeMessage.style.display = "none"
}

// Validation functions
function validateSignupForm(data) {
  // Name validation
  if (data.name.length < 2) {
    showError("Name must be at least 2 characters long")
    return false
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.email)) {
    showError("Please enter a valid email address")
    return false
  }

  // Mobile validation
  const mobileRegex = /^[0-9]{10}$/
  if (!mobileRegex.test(data.mobile.replace(/\D/g, ""))) {
    showError("Please enter a valid 10-digit mobile number")
    return false
  }

  // Password validation
  if (data.password.length < 6) {
    showError("Password must be at least 6 characters long")
    return false
  }

  // Confirm password validation
  if (data.password !== data.confirmPassword) {
    showError("Passwords do not match")
    return false
  }

  return true
}

function validateLoginForm(email, password) {
  if (!email || !password) {
    showError("Please fill in all fields")
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    showError("Please enter a valid email address")
    return false
  }

  return true
}

// Utility functions
function showSuccess(message, callback) {
  const successMessage = document.getElementById("successMessage")
  successMessage.textContent = message
  successAnimation.style.display = "flex"

  setTimeout(() => {
    successAnimation.style.display = "none"
    if (callback) callback()
  }, 2000)
}

function showError(message) {
  alert(message) // In a real app, you'd use a better notification system
}

// Testimonials slider
function startTestimonialSlider() {
  const testimonials = document.querySelectorAll(".testimonial")
  let currentIndex = 0

  setInterval(() => {
    testimonials[currentIndex].classList.remove("active")
    currentIndex = (currentIndex + 1) % testimonials.length
    testimonials[currentIndex].classList.add("active")
  }, 4000)
}

// Smooth scroll for hero buttons
document.addEventListener("DOMContentLoaded", () => {
  const heroButtons = document.querySelectorAll(".hero-buttons .btn")
  heroButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      if (btn.textContent === "Book a Ride") {
        e.preventDefault()
        // In a real app, this would open a booking modal
        showSuccess("Booking feature coming soon!")
      } else if (btn.textContent === "View Tariffs") {
        e.preventDefault()
        // In a real app, this would show tariff information
        showSuccess("Tariff information coming soon!")
      }
    })
  })
})

// Add scroll effect to header
window.addEventListener("scroll", () => {
  const header = document.querySelector(".header")
  if (window.scrollY > 100) {
    header.style.background = "rgba(255, 255, 255, 0.95)"
    header.style.backdropFilter = "blur(10px)"
  } else {
    header.style.background = "var(--white)"
    header.style.backdropFilter = "none"
  }
})