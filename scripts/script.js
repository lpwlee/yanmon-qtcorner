// ==================== CONFIGURATION ====================
const CONFIG = {
    // Google Apps Script URL
    SCRIPT_URL: "https://script.google.com/macros/s/AKfycbw2cwlhsTivtCSiwWYK99N7zJBbP4XROOfH6wH3f-gm4Hwal4Clt_AX2OkGGS4ga_6n/exec",
    
    // Google API Configuration
    GOOGLE_API_KEY: "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",
    GOOGLE_CLIENT_ID: "175179802624-jn015u8b1ecjb62c6b05u91btu9ts325.apps.googleusercontent.com",
    
    // Date formats
    DATE_FORMAT: {
        PICKER: "Y-m-d",
        API: "YYYY/MM/DD",
        DISPLAY: "M月D日"
    },
    
    // Sheet configuration
    SHEET: {
        ID: "1boe5G7SQAkVQqzkokAkT3kjjObDckiUhxQ4d1mLZEqA",
        RANGE: "Sheet1!A1:E366",
        COLUMNS: {
            DATE: 0,           // Column A
            TITLE: 1,          // Column B
            BIBLE_CHAPTER: 2,  // Column C
            BIBLE_CONTENT: 3,  // Column D
            THINKING: 4        // Column E
        }
    },
    
    // UI Text
    TEXTS: {
        LOADING: "Loading devotional...",
        NO_DATE: "Please select a date first",
        NO_TITLE: "No title",
        NO_BIBLE_CHAPTER: "No Bible reference",
        NO_BIBLE_CONTENT: "No Bible content",
        NO_THINKING: "No reflection available",
        ERROR_PREFIX: "❌",
        FETCH_ERROR: "Error fetching data"
    }
};
// =======================================================

// Initialize Flatpickr calendar when the page loads
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    
    flatpickr("#datePicker", {
        dateFormat: CONFIG.DATE_FORMAT.PICKER,
        defaultDate: today,
        maxDate: today,
        monthSelectorType: "static",
        onChange: function(selectedDates, dateStr, instance) {
            console.log("Selected date:", dateStr);
        }
    });
    
    document.getElementById("fetchButton").addEventListener("click", fetchDevotionalForDate);
});

function formatDateToSheetFormat(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
}

function formatDateForDisplay(dateStr) {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
}

function fetchDevotionalForDate() {
    const datePicker = document.getElementById("datePicker");
    const selectedDate = datePicker.value;
    
    if (!selectedDate) {
        alert(CONFIG.TEXTS.NO_DATE);
        return;
    }
    
    const formattedDate = formatDateToSheetFormat(selectedDate);
    const displayDate = formatDateForDisplay(selectedDate);
    
    console.log("Selected date (raw):", selectedDate);
    console.log("Sending to API (YYYY/MM/DD):", formattedDate);
    console.log("Display format (M月D日):", displayDate);
    
    const dataDisplay = document.getElementById("dataDisplay");
    dataDisplay.innerHTML = `<div class="loading">${CONFIG.TEXTS.LOADING}</div>`;
    
    const fetchButton = document.getElementById("fetchButton");
    fetchButton.disabled = true;
    
    const urlWithParam = `${CONFIG.SCRIPT_URL}?date=${encodeURIComponent(formattedDate)}`;
    
    console.log("Fetching URL:", urlWithParam);
    
    fetch(urlWithParam)
        .then(response => response.json())
        .then(data => {
            console.log("Response received:", data);
            displayDevotionalData(data, displayDate);
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            dataDisplay.innerHTML = `<div class="error-message">${CONFIG.TEXTS.ERROR_PREFIX} ${CONFIG.TEXTS.FETCH_ERROR}: ${error.message}</div>`;
        })
        .finally(() => {
            fetchButton.disabled = false;
        });
}

function displayDevotionalData(response, displayDate) {
    const dataDisplay = document.getElementById("dataDisplay");
    dataDisplay.innerHTML = "";
    
    if (!response.success) {
        dataDisplay.innerHTML = `<div class="error-message">${CONFIG.TEXTS.ERROR_PREFIX} ${response.message}</div>`;
        return;
    }
    
    const data = response.data;
    
    // Create devotional card
    const cardDiv = document.createElement("div");
    cardDiv.className = "devotional-card";
    
    // Date
    const dateDiv = document.createElement("div");
    dateDiv.className = "devotional-date";
    dateDiv.textContent = displayDate;
    cardDiv.appendChild(dateDiv);
    
    // Title
    const titleDiv = document.createElement("div");
    titleDiv.className = "devotional-title";
    titleDiv.textContent = data.title || CONFIG.TEXTS.NO_TITLE;
    cardDiv.appendChild(titleDiv);
    
    // Bible Chapter
    const chapterDiv = document.createElement("div");
    chapterDiv.className = "devotional-chapter";
    chapterDiv.textContent = data.bible_chapter || CONFIG.TEXTS.NO_BIBLE_CHAPTER;
    cardDiv.appendChild(chapterDiv);
    
    // Bible Content
    const contentDiv = document.createElement("div");
    contentDiv.className = "devotional-content";
    contentDiv.textContent = data.bible_content || CONFIG.TEXTS.NO_BIBLE_CONTENT;
    cardDiv.appendChild(contentDiv);
    
    // Thinking/Reflection
    const thinkingDiv = document.createElement("div");
    thinkingDiv.className = "devotional-thinking";
    
    const thinkingLabel = document.createElement("div");
    thinkingLabel.className = "thinking-label";
    thinkingLabel.textContent = "💭 反思與應用";
    thinkingDiv.appendChild(thinkingLabel);
    
    const thinkingText = document.createElement("div");
    thinkingText.className = "thinking-text";
    thinkingText.textContent = data.thinking || CONFIG.TEXTS.NO_THINKING;
    thinkingDiv.appendChild(thinkingText);
    
    cardDiv.appendChild(thinkingDiv);
    
    dataDisplay.appendChild(cardDiv);
}

// Google API functions (kept for compatibility)
function handleClientLoad() {
    gapi.load("client:auth2", initClient);
}

function initClient() {
    gapi.client
        .init({
            apiKey: CONFIG.GOOGLE_API_KEY,
            clientId: CONFIG.GOOGLE_CLIENT_ID,
            discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
            scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
        })
        .then(function () {
            gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
            updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        });
}

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        console.log("Signed in to Google");
    }
}