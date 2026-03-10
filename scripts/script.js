document.getElementById("fetchButton").addEventListener("click", function () {
  fetch("YOUR_APPS_SCRIPT_URL") // Replace with your Google Apps Script URL
    .then((response) => response.json())
    .then((data) => {
      const dataDisplay = document.getElementById("dataDisplay");
      dataDisplay.innerHTML = ""; // Clear previous data

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
      apiKey: "YOUR_API_KEY", // Replace with your API key
      clientId: "YOUR_CLIENT_ID", // Replace with your client ID
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
      spreadsheetId: "YOUR_SHEET_ID", // Replace with your Sheet ID
      range: "Sheet1!A1:C10", // Adjust your range here
    })
    .then(
      function (response) {
        const range = response.result;
        if (range.values.length > 0) {
          displayData(range.values);
        } else {
          console.log("No data found.");
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
    rowDiv.textContent = row.join(", ");
    dataDisplay.appendChild(rowDiv);
  });
}
