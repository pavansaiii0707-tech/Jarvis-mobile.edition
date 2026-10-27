"use strict";

const API_BASE_URL = "https://jarvis-core-js4s.onrender.com";

const form = document.getElementById("chatForm");
const input = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const chat = document.getElementById("chat");
const clock = document.getElementById("clock");
const coreRing = document.getElementById("coreRing");
const coreState = document.getElementById("coreState");
const connectionNote = document.getElementById("connectionNote");
const aiStatus = document.getElementById("aiStatus");
const networkStatus = document.getElementById("networkStatus");

const SESSION_ID =
  "jarvis-" + Math.random().toString(36).slice(2) + Date.now();

let accessToken = null;
let loginPromise = null;

function updateClock() {
  if (!clock) return;

  clock.textContent = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

updateClock();
setInterval(updateClock, 1000);

function addMessage(sender, text, className = "system-msg") {
  if (!chat) return;

  const message = document.createElement("p");
  message.className = `msg ${className}`;

  const label = document.createElement("span");
  label.textContent = sender;

  const content = document.createElement("div");
  content.textContent = text;

  message.append(label, content);
  chat.appendChild(message);
  chat.scrollTop = chat.scrollHeight;
}

function setStatus(text) {
  if (connectionNote) connectionNote.textContent = text;
}

function setNetwork(text) {
  if (networkStatus) networkStatus.textContent = text;
}

async function login() {
  if (accessToken) return accessToken;
  if (loginPromise) return loginPromise;

  loginPromise = (async () => {
    const password = window.prompt(
      "Enter your JARVIS login password:"
    );

    if (!password) {
      throw new Error("Login cancelled. Please try again.");
    }

    let response;

    try {
      response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ password })
      });
    } catch {
      throw new Error(
        "Cannot reach JARVIS Core. Check your internet connection."
      );
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Incorrect login password.");
      }

      throw new Error(
        data.detail || `Login failed: ${response.status}`
      );
    }

    if (!data.access_token) {
      throw new Error("Login did not return an access token.");
    }

    accessToken = data.access_token;
    return accessToken;
  })();

  try {
    return await loginPromise;
  } finally {
    loginPromise = null;
  }
}

async function sendToJarvis(message) {
  const token = await login();

  let response;

  try {
    response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        message: message,
        session_id: SESSION_ID
      })
    });
  } catch {
    throw new Error(
      "Cannot connect to JARVIS Core. Check your internet."
    );
  }

  if (response.status === 401) {
    accessToken = null;
    throw new Error(
      "Login expired or rejected. Send your message again."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.detail || `JARVIS Core error: ${response.status}`
    );
  }

  if (!data.reply || typeof data.reply !== "string") {
    throw new Error("JARVIS returned no reply.");
  }

  return data.reply.trim();
}

if (form && input && sendButton) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = input.value.trim();

    if (!message || sendButton.disabled) return;

    addMessage("YOU", message, "user-msg");
    input.value = "";
    sendButton.disabled = true;
    sendButton.textContent = "WAIT...";

    if (coreRing) coreRing.classList.add("thinking");
    if (coreState) coreState.textContent = "PROCESSING";
    if (aiStatus) aiStatus.textContent = "CONNECTING";

    setStatus("CONNECTING TO JARVIS CORE...");
    setNetwork("CONNECTING");

    try {
      const reply = await sendToJarvis(message);

      addMessage("J.A.R.V.I.S.", reply, "system-msg");
      setStatus("JARVIS CORE CONNECTED");
      setNetwork("ONLINE");

      if (aiStatus) aiStatus.textContent = "ONLINE";
    } catch (error) {
      addMessage(
        "SYSTEM",
        error.message || "An unexpected error occurred.",
        "system-msg"
      );

      setStatus("BACKEND CONNECTION FAILED");
      setNetwork("ERROR");
    } finally {
      sendButton.disabled = false;
      sendButton.textContent = "SEND ■";

      if (coreRing) coreRing.classList.remove("thinking");
      if (coreState) coreState.textContent = "STANDBY";

      input.focus();
    }
  });
  }
