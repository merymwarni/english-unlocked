
// ==========================================
// 1. NAVIGATION BETWEEN PAGES
// ==========================================

function showPage(pageId) {
    const selectedPage = document.getElementById(pageId);

    if (!selectedPage) {
        console.warn("Page not found:", pageId);
        return;
    }

    // Stop speaking activities when leaving Speaking Practice
    if (pageId !== "speakingPractice") {
        stopSpeakingRecognition();

        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
    }

    // Hide all pages
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    // Show selected page
    selectedPage.classList.add("active");

    // Update active navigation menu
    document.querySelectorAll(".nav-menu a").forEach(link => {
        link.classList.remove("active");

        if (link.getAttribute("href") === "#" + pageId) {
            link.classList.add("active");
        }
    });

    window.scrollTo(0, 0);
}


// Navigation event listener
document.querySelectorAll(".nav-menu a").forEach(link => {
    link.addEventListener("click", function(event) {
        const href = this.getAttribute("href");

        if (href && href.startsWith("#")) {
            event.preventDefault();
            showPage(href.substring(1));
        }
    });
});


// ==========================================
// 2. SPEAKING PRACTICE PAGE NAVIGATION
// ==========================================

function openSpeakingPractice() {
    showPage("speakingPractice");
    showSpeakingTab("speakingMaterial");
}


function showSpeakingTab(tabId) {
    const tabs = [
        "speakingMaterial",
        "speakingExercise"
    ];

    if (!tabs.includes(tabId)) return;

    // Stop current recognition and pronunciation
    stopSpeakingRecognition();

    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }

    tabs.forEach(id => {
        const section = document.getElementById(id);

        if (section) {
            section.style.display =
                id === tabId ? "block" : "none";
        }
    });

    if (tabId === "speakingExercise") {
        currentSpeakingIndex = 0;
        displaySpeakingQuestion();
    }

    window.scrollTo(0, 0);
}


// ==========================================
// 3. SPEAKING PRACTICE - QUESTIONS
// ==========================================

const speakingPrompts = [
    "Bali is a beautiful place to visit.",
    "I visited Kuta Beach with my family.",
    "Tanah Lot Temple is near the sea.",
    "Travelling helps us learn about different cultures.",
    "I hope to visit Bali again someday."
];

let currentSpeakingIndex = 0;
let recognition = null;
let isRecognizing = false;


// Display speaking question
function displaySpeakingQuestion() {
    const number = document.getElementById("speakingNumber");
    const prompt = document.getElementById("speakingPrompt");
    const feedback = document.getElementById("speakingFeedback");
    const recognized = document.getElementById("recognizedSpeech");
    const nextButton = document.getElementById("nextSpeaking");
    const startButton = document.getElementById("startSpeaking");
    const status = document.getElementById("speakingStatus");

    if (number) {
        number.textContent =
            `Question ${currentSpeakingIndex + 1} of ${speakingPrompts.length}`;
    }

    if (prompt) {
        prompt.textContent = speakingPrompts[currentSpeakingIndex];
    }

    if (feedback) {
        feedback.textContent = "";
        feedback.className = "";
    }

    if (recognized) {
        recognized.textContent = "Your speech will appear here.";
    }

    if (status) {
        status.textContent = "Ready to practice.";
    }

    if (startButton) {
        startButton.disabled = false;
    }

    if (nextButton) {
        nextButton.disabled =
            currentSpeakingIndex === speakingPrompts.length - 1;
    }
}


// ==========================================
// 4. HEAR EXAMPLE PRONUNCIATION
// ==========================================

function hearExample() {
    if (!("speechSynthesis" in window)) {
        alert("Your browser does not support speech synthesis.");
        return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(
        speakingPrompts[currentSpeakingIndex]
    );

    utterance.lang = "en-US";
    utterance.rate = 0.85;

    window.speechSynthesis.speak(utterance);
}


// ==========================================
// 5. TEXT NORMALIZATION
// ==========================================

function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/[.,!?]/g, "")
        .trim()
        .replace(/\s+/g, " ");
}


// ==========================================
// 6. CALCULATE TEXT SIMILARITY
// ==========================================

function calculateSimilarity(text1, text2) {
    const a = normalizeText(text1);
    const b = normalizeText(text2);

    if (a === b) return 1;
    if (!a || !b) return 0;

    const matrix = [];

    for (let i = 0; i <= a.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= b.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;

            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }

    const distance = matrix[a.length][b.length];
    const maxLength = Math.max(a.length, b.length);

    return 1 - distance / maxLength;
}


// ==========================================
// 7. STOP SPEAKING RECOGNITION
// ==========================================

function stopSpeakingRecognition() {
    if (recognition && isRecognizing) {
        try {
            recognition.abort();
        } catch (error) {
            // Ignore recognition stop errors
        }
    }

    isRecognizing = false;
    recognition = null;
}


// ==========================================
// 8. START SPEAKING RECOGNITION
// ==========================================

function startSpeaking() {
    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    const status = document.getElementById("speakingStatus");
    const recognized = document.getElementById("recognizedSpeech");
    const feedback = document.getElementById("speakingFeedback");
    const startButton = document.getElementById("startSpeaking");

    if (!SpeechRecognition) {
        if (status) {
            status.textContent =
                "Speech Recognition is not supported. Please use Google Chrome.";
        }
        return;
    }

    if (isRecognizing) return;

    recognition = new SpeechRecognition();

    const currentRecognition = recognition;

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    isRecognizing = true;

    if (startButton) startButton.disabled = true;
    if (status) status.textContent = "Listening... Please speak now.";
    if (recognized) recognized.textContent = "Listening...";

    if (feedback) {
        feedback.textContent = "";
        feedback.className = "";
    }

    recognition.onresult = function(event) {
        // Ignore results from an old recognition session
        if (recognition !== currentRecognition) return;

        const spokenText = event.results[0][0].transcript;

        if (recognized) {
            recognized.textContent = spokenText;
        }

        const expectedText =
            speakingPrompts[currentSpeakingIndex];

        const similarity =
            calculateSimilarity(spokenText, expectedText);

        if (feedback) {
            if (similarity >= 0.85) {
                feedback.textContent =
                    "Excellent! Your spoken sentence is very similar to the target sentence.";

                feedback.className = "correct-feedback";
            } else {
                feedback.textContent =
                    "Good try! Listen to the example and try speaking again.";

                feedback.className = "incorrect-feedback";
            }
        }

        if (status) {
            status.textContent = "Speech recognition completed.";
        }
    };

    recognition.onerror = function(event) {
        if (recognition !== currentRecognition) return;

        if (status) {
            if (event.error === "not-allowed" ||
                event.error === "service-not-allowed") {
                status.textContent =
                    "Microphone permission denied. Please allow microphone access.";
            } else if (event.error === "no-speech") {
                status.textContent =
                    "No speech detected. Please try again.";
            } else if (event.error === "audio-capture") {
                status.textContent =
                    "No microphone found. Please check your microphone.";
            } else if (event.error === "network") {
                status.textContent =
                    "Network error. Please check your internet connection.";
            } else if (event.error !== "aborted") {
                status.textContent =
                    "An error occurred. Please try again.";
            }
        }
    };

    recognition.onend = function() {
        if (recognition !== currentRecognition) return;

        isRecognizing = false;
        recognition = null;

        if (startButton) {
            startButton.disabled = false;
        }
    };

    try {
        recognition.start();
    } catch (error) {
        isRecognizing = false;
        recognition = null;

        if (startButton) {
            startButton.disabled = false;
        }

        if (status) {
            status.textContent =
                "Unable to start microphone. Please try again.";
        }
    }
}


// ==========================================
// 9. NEXT SPEAKING QUESTION
// ==========================================

function nextSpeaking() {
    if (isRecognizing) {
        stopSpeakingRecognition();
    }

    if (currentSpeakingIndex < speakingPrompts.length - 1) {
        currentSpeakingIndex++;
        displaySpeakingQuestion();
    }
}


// ==========================================
// 10. READING PRACTICE - ANSWER KEY
// ==========================================

const readingAnswers = {
    r1: "A",
    r2: "C",
    r3: "A",
    r4: "C",
    r5: "B",
    r6: "B",
    r7: "B",
    r8: "C",
    r9: "B",
    r10: "B",
    r11: "B",
    r12: "C"
};


// ==========================================
// 11. CHECK READING ANSWERS
// ==========================================

function checkReading() {
    const result = document.getElementById("readingResult");

    if (!result) return;

    let score = 0;
    const totalQuestions = Object.keys(readingAnswers).length;

    // Check whether all questions are answered
    for (const question in readingAnswers) {
        const selectedAnswer = document.querySelector(
            `input[name="${question}"]:checked`
        );

        if (!selectedAnswer) {
            result.innerHTML =
                "<p>Please answer all 12 questions before submitting.</p>";
            return;
        }

        if (selectedAnswer.value === readingAnswers[question]) {
            score++;
        }
    }

    // Calculate percentage
    const percentage = Math.round(
        (score / totalQuestions) * 100
    );

    // Feedback based on score
    let feedback = "";

    if (score >= 10) {
        feedback =
            "Excellent! You have a great understanding of the text.";
    } else if (score >= 7) {
        feedback =
            "Good job! You understand most of the reading passage.";
    } else if (score >= 5) {
        feedback =
            "Not bad! Keep practicing your reading skills.";
    } else {
        feedback =
            "Keep learning! Read the passage again and try once more.";
    }

    // Display final result
    result.innerHTML = `
        <div class="reading-score">
            <h3>Your Reading Score</h3>
            <h2>${score}/${totalQuestions}</h2>
            <p>Percentage: <strong>${percentage}%</strong></p>
            <p>${feedback}</p>
        </div>
    `;

    result.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


// ==========================================
// 12. OPEN READING PRACTICE
// ==========================================

function openReadingPractice() {
    showPage("readingPractice");

    const form = document.getElementById("readingForm");
    const result = document.getElementById("readingResult");

    if (form) {
        form.reset();
    }

    if (result) {
        result.innerHTML = "";
    }
}


// ==========================================
// 13. RETRY READING PRACTICE
// ==========================================

function retryReading() {
    const form = document.getElementById("readingForm");
    const result = document.getElementById("readingResult");

    if (form) {
        form.reset();
    }

    if (result) {
        result.innerHTML = "";
    }

    window.scrollTo(0, 0);
}


// ==========================================
// 14. INITIALIZE WEBSITE
// ==========================================

document.addEventListener("DOMContentLoaded", function() {
    displaySpeakingQuestion();
});
