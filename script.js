/*
 * J.A.R.V.I.S. interface controller
 * This file makes the animated UI work. It does not connect to an AI server yet.
 *
 * Later, after the private backend is deployed, set API_BASE_URL to its HTTPS base URL
 * and implement your authenticated backend request. Never put a Gemini API key here.
 */
const API_BASE_URL = ""; // Example: "https://your-service.example.com" — leave blank for UI demo.
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
function updateClock() {
 clock.textContent = new Date().toLocaleTimeString([], {
 hour: "2-digit", minute: "2-digit", second: "2-digit"
 });
}
updateClock();
setInterval(updateClock, 1000);
function addMessage(sender, text, className) {
 const message = document.createElement("p");
 message.className = `msg ${className}`;
 const label = document.createElement("span");
 label.textContent = sender;
 const content = document.createElement("div");
 content.textContent = text; // textContent prevents user text being interpreted as HTML.
 message.append(label, content);
 chat.appendChild(message);
 chat.scrollTop = chat.scrollHeight;
}
form.addEventListener("submit", async (event) => {
 event.preventDefault();
 const message = input.value.trim();
 if (!message) return;
 addMessage("YOU", message, "user-msg");
 input.value = "";
 sendButton.disabled = true;
 sendButton.textContent = "WAIT...";
 coreRing.classList.add("thinking");
 coreState.textContent = "PROCESSING";
 try {
 if (!API_BASE_URL) {
 addMessage("J.A.R.V.I.S.", "The visual interface is working. The AI backend is not connected yet, so I cannot answer this message from the AI model.", "system-msg");
 connectionNote.textContent = "VISUAL CORE ACTIVE • BACKEND CONNECTION NOT CONFIGURED";
 } else {
 // Backend integration is intentionally not guessed. Configure this to match
 // your deployed server's authentication and /chat request contract.
 throw new Error("Backend URL is set, but authentication/request integration still needs configuration.");
 }
 } catch (error) {
 addMessage("SYSTEM", error.message || "Request failed.", "system-msg");
 } finally {
 sendButton.disabled = false;
 sendButton.textContent = "SEND ■";
 coreRing.classList.remove("thinking");
 coreState.textContent = "STANDBY";
 input.focus();
 }
});
// Small visual response while processing.
const style = document.createElement("style");
style.textContent = ".core-ring.thinking .ring-outer{animation-duration:2s}.core-ring.thinking .ring-mid{animation-duration:1.6s}.core-ring.thinking .core-center{box-shadow:0 0 30px #55f4ff,0 0 75px rgba(0,234,255,.6)}";
document.head.appendChild(style);
