
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

const sessionId =
  "jarvis-" + Math.random().toString(36).slice(2) + Date.now();

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

function addMessage(sender, text, className) {
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
    if (connectionNote) connectionNote.textContent = "CONNECTING TO JARVIS CORE...";
    if (networkStatus) networkStatus.textContent = "CONNECTING";

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message,
          session_id: sessionId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Backend authentication is required. Secure authentication must be configured."
          );
        }

        throw new Error(data.detail || `Server error: ${response.status}`);
      }

      addMessage("J.A.R.V.I.S.", data.reply, "system-msg");

      if (connectionNote) connectionNote.textContent = "JARVIS CORE CONNECTED";
      if (networkStatus) networkStatus.textContent = "ONLINE";
      if (aiStatus) aiStatus.textContent = "ONLINE";
    } catch (error) {
      addMessage("SYSTEM", error.message || "Connection failed.", "system-msg");

      if (connectionNote) connectionNote.textContent = "BACKEND CONNECTION FAILED";
      if (networkStatus) networkStatus.textContent = "OFFLINE";
    } finally {
      sendButton.disabled = false;
      sendButton.textContent = "SEND ■";

      if (coreRing) coreRing.classList.remove("thinking");
      if (coreState) coreState.textContent = "STANDBY";

      input.focus();
    }
  });
}

const style = document.createElement("style");
style.textContent = `
.core-ring.thinking .ring-outer { animation-duration: 2s; }
.core-ring.thinking .ring-mid { animation-duration: 1.6s; }
.core-ring.thinking .core-center {
  box-shadow: 0 0 30px #55f4ff, 0 0 75px rgba(0,234,255,.6);
}
`;
document.head.appendChild(style);
