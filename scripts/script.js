// ==================== CONFIGURATION ====================
// Update these values when needed
const CONFIG = {
    // Google Apps Script URL
    SCRIPT_URL: "https://script.google.com/macros/s/AKfycbyUbW1npdbM9cup0vXu3LALj3CLlcfUgat3boXAWuRcsGuSGsPXYi6xYX6T8ClDWOG9/exec",
    
    // Google API Configuration
    GOOGLE_API_KEY: "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",
    GOOGLE_CLIENT_ID: "175179802624-jn015u8b1ecjb62c6b05u91btu9ts325.apps.googleusercontent.com",
    
    // Date formats
    DATE_FORMAT: {
        PICKER: "Y-m-d",           // Format for Flatpickr
        API: "YYYY/MM/DD",          // Format sent to API (WITH leading zeros)
        DISPLAY: "M月D日"            // Format shown to users
    },
    
    // Sheet configuration
    SHEET: {
        ID: "1boe5G7SQAkVQqzkokAkT3kjjObDckiUhxQ4d1mLZEqA",
        RANGE: "Sheet1!A1:E366",
        COLUMNS: {
            DATE: 0,        // Column A (index 0)
            TITLE: 1,       // Column B (index 1)
            BIBLE: 2,       // Column C (index 2)
            AUTHOR: 3,      // Column D (index 3)
            CATEGORY: 4     // Column E (index 4)
        }
    },
    
    // UI Text
    TEXTS: {
        LOADING: "Loading devotional...",
        NO_DATE: "Please select a date first",
        NO_TITLE: "No title",
        NO_VERSE: "No verse",
        NO_AUTHOR: "Unknown author",
        NO_CATEGORY: "Uncategorized",
        ERROR_PREFIX: "❌",
        FETCH_ERROR: "Error fetching data"
    }
};
// =======================================================

// Initialize Flatpickr calendar when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize date picker
    const today = new Date();
    
    flatpickr("#datePicker", {
        dateFormat: CONFIG.DATE_FORMAT.PICKER,
        defaultDate: today,
        maxDate: today, // Can't select future dates
        monthSelectorType: "static",
        onChange: function(selectedDates, dateStr, instance) {
            console.log("Selected date:", dateStr);
        }
    });
    
    // Add event listener to fetch button
    document.getElementById("fetchButton").addEventListener("click", fetchDevotionalForDate);
});

// Format date to match the format in your sheet (WITH leading zeros)
function formatDateToSheetFormat(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Add leading zero
    const day = String(date.getDate()).padStart(2, '0'); // Add leading zero
    
    // Return in YYYY/MM/DD format (WITH leading zeros)
    return `${year}/${month}/${day}`;
}

// Format date for display (M月D日)
function formatDateForDisplay(dateStr) {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
}

// Fetch devotional for selected date
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
    
    // Show loading state
    const dataDisplay = document.getElementById("dataDisplay");
    dataDisplay.innerHTML = `<div class="loading">${CONFIG.TEXTS.LOADING}</div>`;
    
    // Disable button while fetching
    const fetchButton = document.getElementById("fetchButton");
    fetchButton.disabled = true;
    
    // Construct the URL with date parameter
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

// Display the devotional data
function displayDevotionalData(response, displayDate) {
    const dataDisplay = document.getElementById("dataDisplay");
    dataDisplay.innerHTML = ""; // Clear previous data
    
    if (!response.success) {
        dataDisplay.innerHTML = `<div class="error-message">${CONFIG.TEXTS.ERROR_PREFIX} ${response.message}</div>`;
        return;
    }
    
    const data = response.data;
    
    // Create a nice card layout for the devotional
    const cardDiv = document.createElement("div");
    cardDiv.className = "devotional-card";
    
    // Add date
    const dateDiv = document.createElement("div");
    dateDiv.className = "devotional-date";
    dateDiv.textContent = displayDate;
    cardDiv.appendChild(dateDiv);
    
    // Add category if available (Column E)
    if (data.category) {
        const categoryDiv = document.createElement("div");
        categoryDiv.className = "devotional-category";
        categoryDiv.textContent = `📌 ${data.category}`;
        cardDiv.appendChild(categoryDiv);
    }
    
    // Add title (Column B)
    const titleDiv = document.createElement("div");
    titleDiv.className = "devotional-title";
    titleDiv.textContent = data.title || CONFIG.TEXTS.NO_TITLE;
    cardDiv.appendChild(titleDiv);
    
    // Add Bible verse (Column C)
    const verseDiv = document.createElement("div");
    verseDiv.className = "devotional-verse";
    verseDiv.textContent = data.bible_chapter || CONFIG.TEXTS.NO_VERSE;
    cardDiv.appendChild(verseDiv);
    
    // Add author if available (Column D)
    if (data.author) {
        const authorDiv = document.createElement("div");
        authorDiv.className = "devotional-author";
        authorDiv.textContent = `✍️ ${data.author}`;
        cardDiv.appendChild(authorDiv);
    }
    
    dataDisplay.appendChild(cardDiv);
}

// Keep the existing Google API functions
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