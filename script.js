
// ==================================================
// ENGLISH UNLOCKED | TRAVELLING ADVENTURE
// FINAL SCRIPT.JS
// ==================================================


// ==================================================
// 1. NAVIGATION BETWEEN PAGES
// ==================================================

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

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ==================================================
// 2. SPEAKING PRACTICE PAGE NAVIGATION
// ==================================================

function openSpeakingPractice() {

    showPage("speakingPractice");
    showSpeakingTab("speakingMaterial");

}


function showSpeakingTab(tabId) {

    const tabs = [
        "speakingMaterial",
        "speakingExercise"
    ];

    if (!tabs.includes(tabId)) {
        return;
    }

    // Stop previous recognition
    stopSpeakingRecognition();

    // Stop previous pronunciation
    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }

    // Show selected speaking section
    tabs.forEach(id => {

        const section = document.getElementById(id);

        if (section) {
            section.style.display =
                id === tabId ? "block" : "none";
        }

    });

    // Reset exercise when starting practice
    if (tabId === "speakingExercise") {

        currentSpeakingIndex = 0;

        displaySpeakingQuestion();

    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ==================================================
// 3. SPEAKING PRACTICE QUESTIONS
// ==================================================

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
            `Sentence ${currentSpeakingIndex + 1} of ${speakingPrompts.length}`;

    }


    if (prompt) {

        prompt.textContent =
            speakingPrompts[currentSpeakingIndex];

    }


    if (feedback) {

        feedback.textContent = "";

        feedback.className = "";

    }


    if (recognized) {

        recognized.textContent =
            "Your speech will appear here.";

    }


    if (status) {

        status.textContent =
            "Click Start Speaking to begin.";

    }


    if (startButton) {

        startButton.disabled = false;

    }


    if (nextButton) {

        nextButton.disabled =
            currentSpeakingIndex === speakingPrompts.length - 1;

    }

}


// ==================================================
// 4. HEAR EXAMPLE PRONUNCIATION
// ==================================================

function hearExample() {

    if (!("speechSynthesis" in window)) {

        alert(
            "Your browser does not support speech synthesis."
        );

        return;

    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(
        speakingPrompts[currentSpeakingIndex]
    );

    utterance.lang = "en-US";

    utterance.rate = 0.85;

    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);

}


// ==================================================
// 5. TEXT NORMALIZATION
// ==================================================

function normalizeText(text) {

    return text

        .toLowerCase()

        .replace(/[.,!?;:'"]/g, "")

        .trim()

        .replace(/\s+/g, " ");

}


// ==================================================
// 6. CALCULATE TEXT SIMILARITY
// ==================================================

function calculateSimilarity(text1, text2) {

    const a = normalizeText(text1);

    const b = normalizeText(text2);

    if (a === b) {
        return 1;
    }

    if (!a || !b) {
        return 0;
    }

    const matrix = [];

    for (let i = 0; i <= a.length; i++) {

        matrix[i] = [i];

    }

    for (let j = 0; j <= b.length; j++) {

        matrix[0][j] = j;

    }

    for (let i = 1; i <= a.length; i++) {

        for (let j = 1; j <= b.length; j++) {

            const cost =
                a[i - 1] === b[j - 1] ? 0 : 1;

            matrix[i][j] = Math.min(

                matrix[i - 1][j] + 1,

                matrix[i][j - 1] + 1,

                matrix[i - 1][j - 1] + cost

            );

        }

    }

    const distance =
        matrix[a.length][b.length];

    const maxLength =
        Math.max(a.length, b.length);

    return 1 - distance / maxLength;

}


// ==================================================
// 7. STOP SPEAKING RECOGNITION
// ==================================================

function stopSpeakingRecognition() {

    if (recognition) {

        const oldRecognition = recognition;

        recognition = null;

        isRecognizing = false;

        try {

            oldRecognition.abort();

        } catch (error) {

            // Ignore recognition stop errors

        }

    } else {

        isRecognizing = false;

    }

}


// ==================================================
// 8. START SPEAKING RECOGNITION
// ==================================================

function startSpeaking() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    const status =
        document.getElementById("speakingStatus");

    const recognized =
        document.getElementById("recognizedSpeech");

    const feedback =
        document.getElementById("speakingFeedback");

    const startButton =
        document.getElementById("startSpeaking");


    // Check browser support
    if (!SpeechRecognition) {

        if (status) {

            status.textContent =
                "Speech Recognition is not supported. Please use Google Chrome.";

        }

        return;

    }


    // Prevent multiple recognition sessions
    if (isRecognizing) {
        return;
    }


    const currentRecognition =
        new SpeechRecognition();

    recognition = currentRecognition;


    currentRecognition.lang = "en-US";

    currentRecognition.interimResults = false;

    currentRecognition.maxAlternatives = 1;


    isRecognizing = true;


    if (startButton) {
        startButton.disabled = true;
    }

    if (status) {
        status.textContent =
            "Listening... Please speak now.";
    }

    if (recognized) {
        recognized.textContent = "Listening...";
    }

    if (feedback) {

        feedback.textContent = "";

        feedback.className = "";

    }


    // Speech recognition result
    currentRecognition.onresult = function(event) {

        if (recognition !== currentRecognition) {
            return;
        }

        if (!event.results || !event.results[0]) {
            return;
        }

        const spokenText =
            event.results[0][0].transcript;

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

                feedback.className =
                    "correct-feedback";

            } else {

                feedback.textContent =
                    "Good try! Listen to the example and try speaking again.";

                feedback.className =
                    "wrong-feedback";

            }

        }


        if (status) {

            status.textContent =
                "Speech recognition completed.";

        }

    };


    // Speech recognition error
    currentRecognition.onerror = function(event) {

        if (recognition !== currentRecognition) {
            return;
        }

        if (!status) {
            return;
        }

        if (
            event.error === "not-allowed" ||
            event.error === "service-not-allowed"
        ) {

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

    };


    // Recognition finished
    currentRecognition.onend = function() {

        if (recognition !== currentRecognition) {
            return;
        }

        recognition = null;

        isRecognizing = false;


        if (startButton) {
            startButton.disabled = false;
        }

    };


    // Start microphone
    try {

        currentRecognition.start();

    } catch (error) {

        recognition = null;

        isRecognizing = false;


        if (startButton) {
            startButton.disabled = false;
        }

        if (status) {

            status.textContent =
                "Unable to start microphone. Please try again.";

        }

    }

}


// ==================================================
// 9. NEXT SPEAKING QUESTION
// ==================================================

function nextSpeaking() {

    if (isRecognizing) {

        stopSpeakingRecognition();

    }

    if (
        currentSpeakingIndex <
        speakingPrompts.length - 1
    ) {

        currentSpeakingIndex++;

        displaySpeakingQuestion();

    }

}


// ==================================================
// 10. READING PRACTICE - ANSWER KEY
// ==================================================

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


// ==================================================
// 11. CHECK READING ANSWERS
// ==================================================

function checkReading() {

    const result =
        document.getElementById("readingResult");

    const form =
        document.getElementById("readingForm");


    if (!result || !form) {
        return;
    }


    let score = 0;

    const totalQuestions =
        Object.keys(readingAnswers).length;


    // Check whether all questions are answered
    for (const question in readingAnswers) {

        const selectedAnswer =
            form.querySelector(
                `input[name="${question}"]:checked`
            );


        if (!selectedAnswer) {

            result.style.display = "block";

            result.innerHTML = `
                <div class="result-card">
                    <p class="wrong-feedback">
                        Please answer all 12 questions before submitting.
                    </p>
                </div>
            `;

            return;

        }


        if (
            selectedAnswer.value ===
            readingAnswers[question]
        ) {

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
    result.style.display = "block";

    result.innerHTML = `

        <div class="reading-score">

            <h3>Your Reading Score</h3>

            <h2>${score}/${totalQuestions}</h2>

            <p>
                Percentage:
                <strong>${percentage}%</strong>
            </p>

            <p>${feedback}</p>

        </div>

    `;


    result.scrollIntoView({

        behavior: "smooth",

        block: "center"

    });

}


// ==================================================
// 12. OPEN READING PRACTICE
// ==================================================

function openReadingPractice() {

    showPage("readingPractice");

    const form =
        document.getElementById("readingForm");

    const result =
        document.getElementById("readingResult");


    if (form) {
        form.reset();
    }


    if (result) {

        result.innerHTML = "";

        result.style.display = "none";

    }

}


// ==================================================
// 13. RETRY READING PRACTICE
// ==================================================

function retryReading() {

    const form =
        document.getElementById("readingForm");

    const result =
        document.getElementById("readingResult");


    if (form) {
        form.reset();
    }


    if (result) {

        result.innerHTML = "";

        result.style.display = "none";

    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// ==================================================
// 14. LISTENING QUIZ - ANSWER KEY
// ==================================================

const listeningAnswers = {

    lq1: "B",

    lq2: "C",

    lq3: "B",

    lq4: "B",

    lq5: "C",

    lq6: "B",

    lq7: "C",

    lq8: "C",

    lq9: "C",

    lq10: "C"

};


// ==================================================
// 15. LISTENING QUIZ - EXPLANATIONS
// ==================================================

const listeningExplanations = {

    lq1:
        "The audio discusses a student's experience of travelling alone.",

    lq2:
        "The correct answer is based on the reason explained by the speaker in the audio.",

    lq3:
        "The speaker explains the importance of preparing and planning before travelling.",

    lq4:
        "The answer reflects the speaker's feelings and experience during the trip.",

    lq5:
        "The experience of travelling alone can help students develop independence and responsibility.",

    lq6:
        "Planning helps travellers avoid problems related to time, money, and transportation.",

    lq7:
        "The answer reflects the main message about the benefits and responsibilities of solo travelling.",

    lq8:
        "Travelling can provide opportunities to face challenges and learn new things.",

    lq9:
        "One person's experience does not necessarily represent everyone's experience.",

    lq10:
        "Students should consider their own circumstances, safety, budget, and needs before travelling."

};


// ==================================================
// 16. CHECK LISTENING QUIZ
// ==================================================

function checkListeningQuiz() {

    const form =
        document.getElementById("listeningForm");

    const result =
        document.getElementById("listeningResult");


    if (!form || !result) {
        return;
    }


    let correct = 0;

    let incorrect = 0;

    let unanswered = [];


    // Remove previous feedback
    form.querySelectorAll(".question-feedback").forEach(item => {

        item.remove();

    });


    // Check every question
    for (let i = 1; i <= 10; i++) {

        const question = `lq${i}`;

        const selected =
            form.querySelector(
                `input[name="${question}"]:checked`
            );

        const firstInput =
            form.querySelector(
                `input[name="${question}"]`
            );


        // Find question container
        const card =
            firstInput
                ? firstInput.closest(".question-card")
                : null;


        if (!selected) {

            unanswered.push(i);

            continue;

        }


        // Check correct or incorrect answer
        const isCorrect =
            selected.value === listeningAnswers[question];


        if (isCorrect) {

            correct++;

        } else {

            incorrect++;

        }


        // Create feedback
        if (card) {

            const feedback =
                document.createElement("div");

            feedback.className =
                "question-feedback";


            if (isCorrect) {

                feedback.innerHTML = `

                    <p class="feedback-correct">
                        ✓ Correct! Excellent answer.
                    </p>

                    <p>
                        ${listeningExplanations[question]}
                    </p>

                `;

            } else {

                feedback.innerHTML = `

                    <p class="feedback-incorrect">
                        ✕ Incorrect. The correct answer is
                        <strong>${listeningAnswers[question]}</strong>.
                    </p>

                    <p>
                        ${listeningExplanations[question]}
                    </p>

                `;

            }


            card.appendChild(feedback);

        }

    }


    // Check unanswered questions
    if (unanswered.length > 0) {

        result.style.display = "block";

        result.innerHTML = `

            <div class="quiz-result">

                <p class="wrong-feedback">
                    Please answer all questions before submitting.
                </p>

                <p>
                    Unanswered questions:
                    <strong>${unanswered.join(", ")}</strong>
                </p>

            </div>

        `;

        return;

    }


    // Calculate final score
    const score = correct * 10;


    // Feedback based on score
    let message = "";


    if (score === 100) {

        message =
            "Excellent! You are a listening superstar!";

    } else if (score >= 80) {

        message =
            "Great job! You understand the audio very well!";

    } else if (score >= 70) {

        message =
            "Good work! Keep improving your listening skills!";

    } else if (score >= 60) {

        message =
            "Nice try! Practice more to improve your score!";

    } else {

        message =
            "Don't give up! Listen again and try once more!";

    }


    // Display result
    result.style.display = "block";

    result.innerHTML = `

        <div class="quiz-result">

            <h3>Your Listening Quiz Result</h3>

            <h2>${score}/100</h2>

            <p>
                <strong>Correct Answers:</strong>
                ${correct}/10
            </p>

            <p>
                <strong>Incorrect Answers:</strong>
                ${incorrect}/10
            </p>

            <p>
                <strong>Final Score:</strong>
                ${score}
            </p>

            <h4>${message}</h4>

        </div>

    `;


    // Disable answers after successful submission
    form.querySelectorAll("input").forEach(input => {

        input.disabled = true;

    });


    result.scrollIntoView({

        behavior: "smooth",

        block: "center"

    });

}


// ==================================================
// 17. RETRY LISTENING QUIZ
// ==================================================

function retryListeningQuiz() {

    const form =
        document.getElementById("listeningForm");

    const result =
        document.getElementById("listeningResult");


    if (form) {

        form.reset();


        // Enable all answers again
        form.querySelectorAll("input").forEach(input => {

            input.disabled = false;

        });


        // Remove previous feedback
        form.querySelectorAll(".question-feedback").forEach(item => {

            item.remove();

        });

    }


    if (result) {

        result.innerHTML = "";

        result.style.display = "none";

    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// ==================================================
// 18. WEBSITE INITIALIZATION
// ==================================================

document.addEventListener("DOMContentLoaded", function() {


    // Navigation menu
    document.querySelectorAll(".nav-menu a").forEach(link => {

        link.addEventListener("click", function(event) {

            const href =
                this.getAttribute("href");


            if (href && href.startsWith("#")) {

                event.preventDefault();

                const pageId =
                    href.substring(1);

                showPage(pageId);

            }

        });

    });


    // Display initial page
    const activePage =
        document.querySelector(".page.active");

    const firstPage =
        document.querySelector(".page");

    if (activePage) {

        showPage(activePage.id);

    } else if (document.getElementById("home")) {

        showPage("home");

    } else if (firstPage) {

        showPage(firstPage.id);

    }


    // Initialize speaking practice
    displaySpeakingQuestion();


    // Hide listening result when the website starts
    const listeningResult =
        document.getElementById("listeningResult");

    if (listeningResult) {

        listeningResult.style.display = "none";

    }


    // Hide reading result when the website starts
    const readingResult =
        document.getElementById("readingResult");

    if (readingResult) {

        readingResult.style.display = "none";

    }

});


// ================= REFLECTION =================

function submitReflection() {

    const name = document.getElementById("studentName").value.trim();
    const studentClass = document.getElementById("studentClass").value.trim();

    const learning = document.getElementById("learningAnswer").value.trim();
    const experience = document.getElementById("experienceAnswer").value.trim();
    const nextStep = document.getElementById("nextStepAnswer").value.trim();

    const learningLevel = document.querySelector(
        'input[name="learningLevel"]:checked'
    );

    const message = document.getElementById("reflectionMessage");

    if (
        !name ||
        !learning ||
        !experience ||
        !learningLevel ||
        !nextStep
    ) {
        message.textContent = "Please complete all reflection sections first!";
        message.style.color = "red";
        return;
    }

    const reflectionData = `
MY LEARNING REFLECTION

Name: ${name}
Class: ${studentClass || "Not provided"}

1. What Did I Learn?
${learning}

2. My Learning Experience
${experience}

3. Self-Assessment
${learningLevel.value}

4. My Next Step
${nextStep}
    `;

    const blob = new Blob([reflectionData], {
        type: "text/plain"
    });

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = name.replace(/\s+/g, "_") + "_Reflection.txt";

    link.click();

    URL.revokeObjectURL(link.href);

    message.textContent = "Great job! Your reflection has been completed.";
    message.style.color = "green";
}
