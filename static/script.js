const questionInput = document.getElementById("questionInput");
const sendButton = document.getElementById("sendButton");
const chatMessages = document.getElementById("chatMessages");
const typingIndicator = document.getElementById("typingIndicator");


// Send question when Enter is pressed
questionInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendQuestion();
    }
});


// Send question to Flask backend
async function sendQuestion() {

    const question = questionInput.value.trim();

    if (!question) {
        questionInput.focus();
        return;
    }

    addMessage(question, "user");

    questionInput.value = "";

    showTyping(true);

    sendButton.disabled = true;

    try {

        const response = await fetch("/ask", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                question: question
            })
        });

        const data = await response.json();

        showTyping(false);

        if (data.success) {

            addMessage(data.answer, "bot");

            showMatchInformation(
                data.matched_question,
                data.confidence,
                data.status
            );

        } else {

            addMessage(
                data.message || "Something went wrong. Please try again.",
                "bot"
            );

        }

    } catch (error) {

        showTyping(false);

        addMessage(
            "Sorry, I could not connect to the chatbot server. Please make sure the Flask application is running.",
            "bot"
        );

        console.error(error);

    } finally {

        sendButton.disabled = false;
        questionInput.focus();

    }
}


// Quick question buttons
function askSuggestion(question) {

    questionInput.value = question;

    sendQuestion();

}


// Add message to chat
function addMessage(message, sender) {

    const messageDiv = document.createElement("div");

    messageDiv.className =
        sender === "user"
            ? "message user-message"
            : "message bot-message";


    const avatar = document.createElement("div");

    avatar.className = "avatar";

    avatar.textContent =
        sender === "user"
            ? "👤"
            : "🤖";


    const content = document.createElement("div");

    content.className = "message-content";


    const paragraph = document.createElement("p");

    paragraph.textContent = message;


    const time = document.createElement("span");

    time.className = "message-time";

    time.textContent =
        sender === "user"
            ? "You"
            : "FAQBot AI";


    content.appendChild(paragraph);

    content.appendChild(time);

    messageDiv.appendChild(avatar);

    messageDiv.appendChild(content);

    chatMessages.appendChild(messageDiv);


    // Automatically scroll to latest message
    chatMessages.scrollTop = chatMessages.scrollHeight;

}


// Show typing animation
function showTyping(show) {

    if (show) {

        typingIndicator.classList.remove("hidden");

    } else {

        typingIndicator.classList.add("hidden");

    }

}


// Show FAQ matching information
function showMatchInformation(
    matchedQuestion,
    confidence,
    status
) {

    const matchInfo =
        document.getElementById("matchInfo");

    const matchedQuestionElement =
        document.getElementById("matchedQuestion");

    const confidenceElement =
        document.getElementById("confidence");

    const confidenceStatus =
        document.getElementById("confidenceStatus");


    matchedQuestionElement.textContent =
        matchedQuestion;

    confidenceElement.textContent =
        confidence + "%";

    confidenceStatus.textContent =
        status + " confidence";


    matchInfo.classList.remove("hidden");

}


// Clear chat
function clearChat() {

    chatMessages.innerHTML = `

        <div class="message bot-message">

            <div class="avatar">
                🤖
            </div>

            <div class="message-content">

                <p>
                    Chat cleared! 👋
                    Ask me a new question whenever you're ready.
                </p>

                <span class="message-time">
                    FAQBot AI
                </span>

            </div>

        </div>

    `;


    document
        .getElementById("matchInfo")
        .classList.add("hidden");


    questionInput.focus();

}