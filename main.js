import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Configuración de tu proyecto en Firebase
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUÍ",
  authDomain: "zoomi-aa021.firebaseapp.com",
  projectId: "zoomi-aa021",
  storageBucket: "zoomi-aa021.appspot.com",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Nodos del DOM
const authModal = document.getElementById("authModal");
const modalTitle = document.getElementById("modalTitle");
const authForm = document.getElementById("authForm");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const submitAuthBtn = document.getElementById("submitAuthBtn");
const toggleText = document.getElementById("toggleText");
const authAlert = document.getElementById("authAlert");
const logoutBtn = document.getElementById("logoutBtn");
const cancelBtn = document.getElementById("cancelBtn");

let isRegisterMode = false;

// MOSTRAR MENSAJES DE ALERTA
function showAlert(message, isError = true) {
  authAlert.textContent = message;
  authAlert.style.color = isError ? "#721c24" : "#155724";
  authAlert.style.backgroundColor = isError ? "#f8d7da" : "#d4edda";
  authAlert.style.border = isError ? "1px solid #f5c6cb" : "1px solid #c3e6cb";
  authAlert.style.display = "block";
}

function clearAlert() {
  authAlert.style.display = "none";
  authAlert.textContent = "";
}

// CAMBIO ENTRE REGISTRO E INICIO DE SESIÓN
function setAuthMode(register) {
  isRegisterMode = register;
  clearAlert();
  authForm.reset();

  if (isRegisterMode) {
    modalTitle.textContent = "Crear Cuenta";
    submitAuthBtn.textContent = "Registrarse";
    toggleText.innerHTML = '¿Ya tienes cuenta? <a href="#" id="switchAuthLink">Inicia sesión aquí</a>';
  } else {
    modalTitle.textContent = "Iniciar Sesión";
    submitAuthBtn.textContent = "Ingresar";
    toggleText.innerHTML = '¿No tienes cuenta? <a href="#" id="switchAuthLink">Regístrate aquí</a>';
  }

  document.getElementById("switchAuthLink").addEventListener("click", (e) => {
    e.preventDefault();
    setAuthMode(!isRegisterMode);
  });
}

setAuthMode(false);

// REGLA: Mínimo 8 caracteres, al menos 1 letra mayúscula y 1 número
function isPasswordStrong(password) {
  return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

// MANEJO DEL FORMULARIO
authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearAlert();

  const email = authEmail.value.trim();
  const password = authPassword.value;

  if (isRegisterMode) {
    // --- FILTRO DE REGISTRO ---
    if (!isPasswordStrong(password)) {
      showAlert("La contraseña debe incluir al menos 8 caracteres, 1 mayúscula y 1 número.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      await signOut(auth);

      showAlert("¡Registro exitoso! Enviamos un correo de verificación. Confírmalo para poder ingresar.", false);
      setTimeout(() => setAuthMode(false), 4000);

    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        showAlert("Este correo ya está registrado. Haz clic en 'Inicia sesión'.");
      } else {
        showAlert("Error en el registro: " + error.message);
      }
    }

  } else {
    // --- FILTRO DE INICIO DE SESIÓN ---
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (!userCredential.user.emailVerified) {
        showAlert("Debes verificar tu correo electrónico antes de ingresar.");
        await signOut(auth);
        return;
      }

      authModal.style.display = "none";

    } catch (error) {
      showAlert("Correo o contraseña incorrectos.");
    }
  }
});

// CONTROL DE ESTADO DE SESIÓN
onAuthStateChanged(auth, (user) => {
  if (user && user.emailVerified) {
    authModal.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "block";
  } else {
    authModal.style.display = "flex";
    if (logoutBtn) logoutBtn.style.display = "none";
  }
});

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    setAuthMode(false);
  });
}

cancelBtn.addEventListener("click", () => {
  authForm.reset();
  clearAlert();
});