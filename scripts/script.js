document.getElementById("fetchButton").addEventListener("click", function () {
  fetch(
    "https://script.google.com/macros/s/AKfycbwzuyrKdfsxcnQ4XDLMMzB3gw0JsgH9hI5J6pCD9OmfHnsJ3nSxmHoS9IGLGs5xFJkm/exec",
  ) // Replace with your Google Apps Script URL
    .then((response) => response.json())
    .then((data) => {
      const dataDisplay = document.getElementById("dataDisplay");
      dataDisplay.innerHTML = ""; // Clear previous data

      if (data.length === 0) {
        dataDisplay.textContent = "No data found.";
        return;
      }

      data.forEach((row) => {
        const rowDiv = document.createElement("div");
        rowDiv.textContent = row.join(", "); // Join columns with a comma
        dataDisplay.appendChild(rowDiv);
      });
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      alert("Error fetching data. Check the console for details.");
    });
});

// Load the API client and auth2 library
function handleClientLoad() {
  gapi.load("client:auth2", initClient);
}

// Initialize the API client and set up sign in
function initClient() {
  gapi.client
    .init({
      apiKey: "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", // Replace with your API key
      clientId:
        "175179802624-jn015u8b1ecjb62c6b05u91btu9ts325.apps.googleusercontent.com", // Replace with your Client ID
      discoveryDocs: [
        "https://sheets.googleapis.com/$discovery/rest?version=v4",
      ],
      scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    })
    .then(function () {
      // Listen for sign-in state changes
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
      // Handle the initial sign-in state
      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    });
}

// Handle sign-in state changes
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    fetchData();
  } else {
    gapi.auth2.getAuthInstance().signIn();
  }
}

// Fetch data from Google Sheets
function fetchData() {
  gapi.client.sheets.spreadsheets.values
    .get({
      spreadsheetId: "1boe5G7SQAkVQqzkokAkT3kjjObDckiUhxQ4d1mLZEqA", // Replace with your Sheet ID
      range: "Sheet1!A1:C10", // Adjust your range here
    })
    .then(
      function (response) {
        const range = response.result;
        if (range.values.length > 0) {
          displayData(range.values);
        } else {
          console.log("No data found.");
          document.getElementById("dataDisplay").textContent = "No data found.";
        }
      },
      function (response) {
        console.error("Error: " + response.result.error.message);
      },
    );
}

// Display the fetched data
function displayData(data) {
  const dataDisplay = document.getElementById("dataDisplay");
  dataDisplay.innerHTML = ""; // Clear previous data

  data.forEach((row) => {
    const rowDiv = document.createElement("div");
    rowDiv.textContent = row.join(", "); // Join columns with a comma
    dataDisplay.appendChild(rowDiv);
  });
}
