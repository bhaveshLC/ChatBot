const textForm = document.querySelector(".text-form");
const suggestions = document.querySelectorAll('.suggestion-list .suggestion');
const chartList = document.querySelector(".chat-list");
const toggleThemeBtn = document.querySelector("#toggle-theme-button");
const deleteBtn = document.querySelector('#delete-Btn');
let userMessage = null;

const ApiKey = "WRITE YOUR API_KEY";
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${ApiKey}`;

const localStorageData = () => {
  //chat
  const savedChat = localStorage.getItem("saved_chats");

  //theme
  const isLightMode = localStorage.getItem("themeColor") === "light_mode";
  document.body.classList.toggle("light_mode", isLightMode);
  toggleThemeBtn.innerText = isLightMode ? "light_mode" : "dark_mode";
  chartList.innerHTML = savedChat || "";
  document.body.classList.toggle("hide-header",savedChat)
};

localStorageData();
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

const showTypingEffect = (text, textElement, incomingMsg) => {
  let words = text.split(" ");
  console.log(words.length);
  let idx = 0;
  const typeInterval = setInterval(() => {
    textElement.innerText += (idx === 0 ? "" : " ") + words[idx++];
    incomingMsg.querySelector(".icon").classList.add("hide");
    if (idx === words.length) {
      clearInterval(typeInterval);
      incomingMsg.querySelector(".icon").classList.remove("hide");
      localStorage.setItem("saved_chats", chartList.innerHTML);
      chartList.scrollTo(0,chartList.scrollHeight)
    }
  }, 20);
};
const generateAPIResponse = async (incomingMsg) => {
  const textElement = incomingMsg.querySelector(".text");
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: userMessage }],
          },
        ],
      }),
    });
    const data = await response.json();
    console.log(data);
    const apiResponse = data?.candidates[0].content.parts[0].text.replace(
      /\*\*(.*?)\*\*/g,
      "$1"
    );
    showTypingEffect(apiResponse, textElement, incomingMsg);
  } catch (error) {
    console.log(error);
  } finally {
    incomingMsg.classList.remove("loading");
  }
};
const showLoading = () => {
  const html = `<div class="message-content">
                    <img src="icons8-chatbot-50.png" alt="" class="avatar" style="background: #fff;;">
                    <p class="text"></p>
                    <div class="loading-indicator">
                        <div class="loading-bar"></div>
                        <div class="loading-bar"></div>
                        <div class="loading-bar"></div>
                    </div>
                </div>
                <span class="icon material-symbols-rounded" onclick="copyText(this)">content_copy</span>`;
  const incomingMsg = createMessageElement(html, "incoming", "loading");
  chartList.appendChild(incomingMsg);

  generateAPIResponse(incomingMsg);
};
const handleOutgoingMsg = () => {
  userMessage = textForm.querySelector(".input-text").value.trim() || userMessage;
  if (!userMessage) return;

  const html = `<div class="message-content">
                    <img src="profile.png" alt="" class="avatar">
                    <p class="text">${userMessage}</p>
                   </div>`;
  const outgoingMsg = createMessageElement(html, "outgoing");
  chartList.appendChild(outgoingMsg);
  textForm.querySelector(".input-text").value = "";
  textForm.reset();
  document.body.classList.add("hide-header")
  chartList.scrollTo(0,chartList.scrollHeight)

  setTimeout(showLoading(), 3000);
};
textForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleOutgoingMsg();
});

suggestions.forEach(suggestion => {
  suggestion.addEventListener('click',()=>{
    userMessage = suggestion.querySelector('.text').innerText;
    handleOutgoingMsg();
  })
});
const copyText = (copyIcon) => {
  const copyMsg = copyIcon.parentElement.querySelector(".text").innerText;
  window.navigator.clipboard.writeText(copyMsg);
  copyIcon.innerText = "done";
  setTimeout(() => {
    copyIcon.innerText = "content_copy";
  }, 1000);
};

toggleThemeBtn.addEventListener("click", () => {
  const isLightMode = document.body.classList.toggle("light_mode");
  localStorage.setItem("themeColor", isLightMode ? "light_mode" : "dark_mode");
  toggleThemeBtn.innerText = isLightMode ? "dark_mode" : "light_mode";
});


deleteBtn.addEventListener('click',()=>{
    if(confirm("You want to delete chat")){
        localStorage.removeItem('saved_chats');
        document.body.classList.remove("hide-header")
        localStorageData();
    }
})