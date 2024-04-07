

function sendMessage() {
    const userInput = document.getElementById("userInput").value;
    if (!userInput) return;

    const chatContainer = document.getElementById("chatContainer");
    const userMessage = document.createElement("p");
    userMessage.innerText = `You: ${userInput}`;
    chatContainer.appendChild(userMessage);

    // Display loading animation
    const loadingAnimation = document.createElement("div");
    loadingAnimation.classList.add("loading-animation");
    loadingAnimation.innerHTML = `
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>`;
    chatContainer.appendChild(loadingAnimation);

    fetch(`/api/chat?message=${encodeURIComponent(userInput)}`)
        .then(response => response.json())
        .then(data => {
            // Remove loading animation
            loadingAnimation.remove();

            const chatResponse = document.createElement("p");
            chatResponse.innerText = `AgroMinds: ${data.message}`;
            chatContainer.appendChild(chatResponse);
        })
        .catch(error => {
            // Remove loading animation on error
            loadingAnimation.remove();
            console.error("Error fetching data:", error);
        });

    document.getElementById("userInput").value = "";
}



// Remove these lines as they are already defined in the HTML file
// const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

let userText = null;

const loadDataFromLocalstorage = () => {
    // Load saved chats and theme from local storage and apply/add on the page
    const themeColor = localStorage.getItem("themeColor");

    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

    // const defaultText = `<div class="default-text">
    //                         <h1>AgroBot</h1>
    //                         <p>Start a conversation and explore the power of AgroBot.<br> Your chat history will be displayed here.</p>
    //                     </div>`

    chatContainer.innerHTML = localStorage.getItem("all-chats");
    chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to bottom of the chat container
}

const createChatElement = (content, className) => {
    // Create new div and apply chat, specified class and set html content of div
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = content;
    return chatDiv; // Return the created chat div
}



// Modify the getChatResponse function to integrate with EJS
const getChatResponse = async (incomingChatDiv, message) => {
    const pElement = document.createElement("p");

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        pElement.textContent = data.message;
    } catch (error) {
        console.error("Error:", error.message);
        pElement.classList.add("error");
        pElement.textContent = "Oops! Something went wrong while retrieving the response. Please try again.";
    }

    // Remove the typing animation, append the paragraph element and save the chats to local storage
    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
    localStorage.setItem("all-chats", chatContainer.innerHTML);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
}

const copyResponse = (copyBtn) => {
    // Copy the text content of the response to the clipboard
    const responseTextElement = copyBtn.parentElement.querySelector("p");
    navigator.clipboard.writeText(responseTextElement.textContent);
    copyBtn.textContent = "done";
    setTimeout(() => copyBtn.textContent = "content_copy", 1000);
}

const showTypingAnimation = () => {
    // Display the typing animation and call the getChatResponse function
    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="Assets/logo.png" alt="chatbot-img">
                        <div class="typing-animation">
                            <div class="typing-dot" style="--delay: 0.2s"></div>
                            <div class="typing-dot" style="--delay: 0.3s"></div>
                            <div class="typing-dot" style="--delay: 0.4s"></div>
                        </div>
                    </div>
                    <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
                </div>`;
    // Create an incoming chat div with typing animation and append it to chat container
    const incomingChatDiv = createChatElement(html, "incoming");
    chatContainer.appendChild(incomingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    const message = document.getElementById("userInput").value;
    getChatResponse(incomingChatDiv, message);
}

const handleOutgoingChat = () => {
    userText = document.getElementById("userInput").value.trim(); // Get chatInput value and remove extra spaces
    if (!userText) return; // If chatInput is empty return from here

    // Clear the input field and reset its height
    document.getElementById("userInput").value = "";
    // chatInput.style.height = `${initialInputHeight}px`;

    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="Assets/download.png" alt="users-img">
                        <p>${userText}</p>
                    </div>
                </div>`;

    // Create an outgoing chat div with user's message and append it to chat container
    const outgoingChatDiv = createChatElement(html, "outgoing");
    chatContainer.querySelector(".default-text")?.remove();
    chatContainer.appendChild(outgoingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    setTimeout(showTypingAnimation, 500);
}

// Remove the event listener for sendButton as it's now integrated with handleOutgoingChat function

deleteButton.addEventListener("click", () => {
    // Remove the chats from local storage and call loadDataFromLocalstorage function
    if (confirm("Are you sure you want to delete all the chats?")) {
        localStorage.removeItem("all-chats");
        loadDataFromLocalstorage();
    }
});

themeButton.addEventListener("click", () => {
    // Toggle body's class for the theme mode and save the updated theme to the local storage 
    document.body.classList.toggle("light-mode");
    localStorage.setItem("themeColor", themeButton.innerText);
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
});

// Remove the event listeners for chatInput and initialInputHeight as they are not required anymore

// loadDataFromLocalstorage(); // No need to call this as it's already integrated with EJS
