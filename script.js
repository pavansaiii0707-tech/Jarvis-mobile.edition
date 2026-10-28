
function speakJarvis(text) {
  if (!("speechSynthesis" in window)) {
    console.warn("Speech output is not supported.");
    return;
  }

  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-IN";
  speech.rate = 1;
  speech.pitch = 0.9;

  window.speechSynthesis.speak(speech);
}

"use strict";

const API_BASE_URL = "https://jarvis-core-js4s.onrender.com";
const TOKEN_KEY = "jarvis_login_token";

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

const SESSION_ID = "jarvis-" + crypto.randomUUID();

let accessToken = null;

try {
  accessToken = localStorage.getItem(TOKEN_KEY);
} catch {}

function updateClock() {
  if (clock) {
    clock.textContent = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  }
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

async function sendToJarvis(message) {
  if (!accessToken) {
    throw new Error("Please unlock JARVIS first.");
  }

  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      message,
      session_id: SESSION_ID
    })
  });

  if (response.status === 401) {
    accessToken = null;

    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {}

    document.getElementById("jarvisApp").hidden = true;
    document.getElementById("lockScreen").hidden = false;

    throw new Error("Session expired. Unlock JARVIS again.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.detail || `Server error: ${response.status}`);
  }

  if (typeof data.reply !== "string" || !data.reply.trim()) {
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
speakJarvis(reply);
      setStatus("JARVIS CORE CONNECTED");
      setNetwork("ONLINE");
      if (aiStatus) aiStatus.textContent = "ONLINE";
    } catch (error) {
      addMessage("SYSTEM", error.message || "Connection failed.", "system-msg");
      setStatus("CONNECTION FAILED");
      setNetwork("ERROR");
      if (aiStatus) aiStatus.textContent = "OFFLINE";
    } finally {
      sendButton.disabled = false;
      sendButton.textContent = "SEND ▪";
      if (coreRing) coreRing.classList.remove("thinking");
      if (coreState) coreState.textContent = "STANDBY";
    }
  });
      }
const micButton = document.getElementById("micButton");

if (micButton) {
  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    micButton.textContent = "❌";
    micButton.title = "Speech recognition is not supported";
  } else {
    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    micButton.addEventListener("click", () => {
      try {
        recognition.start();
        micButton.textContent = "🔴";
      } catch (error) {
        console.error("Microphone error:", error);
      }
    });

    recognition.onresult = (event) => {
      const transcript =
        event.results[0][0].transcript;

      const messageInput =
        document.querySelector(
          'input[placeholder="Ask J.A.R.V.I.S..."], textarea[placeholder="Ask J.A.R.V.I.S..."]'
        );

      if (messageInput) {
        messageInput.value = transcript;
        messageInput.dispatchEvent(
          new Event("input", { bubbles: true })
        );
      }

      micButton.textContent = "🎙️";
    };

    recognition.onerror = (event) => {
      console.error("Speech error:", event.error);
      micButton.textContent = "🎙️";
    };

    recognition.onend = () => {
      micButton.textContent = "🎙️";
    };
  }
}
