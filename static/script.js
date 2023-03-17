let displayResultsCalled=false;

function toggleInput() {
    const fileUploadLabel = document.getElementById('file-upload-label');
    const fileUpload = document.getElementById('file-upload');
    const manualInputLabel = document.getElementById('manual-input-label');
    const manualInput = document.getElementById('manual-input');
    const toggleInputBtn = document.getElementById('toggle-input');

    if (fileUpload.style.display === 'none') {
        fileUploadLabel.style.display = 'block';
        fileUpload.style.display = 'block';
        manualInputLabel.style.display = 'none';
        manualInput.style.display = 'none';
        toggleInputBtn.innerText = 'Switch to manual input';
    } else {
        fileUploadLabel.style.display = 'none';
        fileUpload.style.display = 'none';
        manualInputLabel.style.display = 'block';
        manualInput.style.display = 'block';
        toggleInputBtn.innerText = 'Switch to CSV input';
    }
}

// Add a submit event listener to the form
document.getElementById('toggle-input').addEventListener('click', toggleInput);
document.getElementById('team-form').addEventListener('submit', async (event) => {

    // Prevent the form from being submitted in the default manner
    event.preventDefault();

    // Get the number of teams from the input field
    const numTeams = document.getElementById('num-teams').value;

    // Get the file that was uploaded
    const fileUpload = document.getElementById('file-upload').files[0];
    const manualUpload = document.getElementById('manual-input');
    // Check if a file was uploaded
    if (!fileUpload && !manualUpload.value) {
        alert('Please select a CSV file to upload, or enter the data manually.');
        return;
    }

    if (fileUpload) {
        processInputFile(fileUpload);
    }
    else {
        processManualInput(manualUpload.value);
    }
});
function processManualInput() {
    const inputText = document.getElementById('manual-input').value;
    const lines = inputText.split('\n');

    const proficiencies = [];
    const studentIds = [];

    for (const line of lines) {
        if (line.trim() != '') {
            // Check if the line contains a tab character, which indicates TSV format
            const separator = line.includes('\t') ? '\t' : ',';
            const columns = line.split(separator);

            studentIds.push(columns[0].trim());
            proficiencies.push(parseFloat(columns[1].trim()));
        }
    }
    sendFormData(proficiencies, studentIds);
}

function processInputFile(file) {
    // Create a FileReader object to read the contents of the uploaded file
    const reader = new FileReader();

    // Add an event listener that triggers when the file has been read
    reader.onload = function (event) {
        // Get the file contents as a string and split it into an array of lines
        const lines = event.target.result.split('\n');

        // Initialize empty arrays to store proficiencies and student IDs/names
        const proficiencies = [];
        const studentIds = [];

        // Loop through each line in the lines array
        for (const line of lines) {
            // Check if the line is not empty after trimming whitespace
            if (line.trim() != '') {
                // Split the line into columns using the comma as a separator
                const columns = line.split(',');

                // Add the first column (student ID/name) to the studentIds array
                studentIds.push(columns[0].trim());

                // Add the second column (proficiency) to the proficiencies array
                // after converting it to a floating-point number
                proficiencies.push(parseFloat(columns[1].trim()));
            }
        }
        console.log('Student IDs before sending:', studentIds);
        // Call the sendFormData function with the proficiencies and studentIds arrays
        sendFormData(proficiencies, studentIds);
    };

    // Read the file as a text file
    reader.readAsText(file);
        
}


function sendFormData(proficiencies, studentIds) {
    // Display the loading message and hide any previous error messages
    document.getElementById('loading-message').style.display = 'block';
    document.getElementById('error-message').style.display = 'none';
    // Get the number of teams from the input field and convert it to an integer
    const numTeams = parseInt(document.getElementById('num-teams').value);

    // Send a POST request to the Flask server with the JSON data
    fetch('/pick_teams', {
        method: 'POST', // Specify the request method as POST
        headers: {
            'Content-Type': 'application/json' // Set the content type of the request body
        },
        body: JSON.stringify({ // Convert the input data to a JSON string
            proficiencies: proficiencies,
            num_teams: numTeams
        })
    })

    .then(response => response.json()) // Convert the response to a JSON object
    .then(results => {
        // Hide the loading message
        document.getElementById('loading-message').style.display = 'none';

        if (!displayResultsCalled) {
            displayResultsCalled = true;
            console.log('results:', results);
            displayResults(results, studentIds);
        }
    }) // Pass the JSON object and studentIds to the displayResults function
    .catch(error => {
        console.error('Error:', error); // Log any errors that occur during the process
        // Hide the loading message and display the error message
        document.getElementById('loading-message').style.display = 'none';
        document.getElementById('error-message').style.display = 'block';
    });
}


function displayResults(results, studentIds) {
    console.log('Student IDs in displayResults:', studentIds);
    const teams = results.teams;
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    const numTeams = teams[0].length;

    // Initialize team arrays
    let teamArrays = [];
    for (let i = 0; i < numTeams; i++) {
        teamArrays.push([]);
    }

    // Fill team arrays with student IDs
    for (let i = 0; i < studentIds.length; i++) {
        for (let j = 0; j < numTeams; j++) {
            if (teams[i][j] === 1) {
                teamArrays[j].push(studentIds[i]);
                break;
            }
        }
    }
    console.log('teamArrays:', teamArrays);

    // Display teams
    for (let i = 0; i < teamArrays.length; i++) {
        const teamDiv = document.createElement('div');
        teamDiv.className = 'team';

        const teamHeading = document.createElement('h3');
        teamHeading.innerText = `Team ${i + 1}`;
        teamDiv.appendChild(teamHeading);

        const teamList = document.createElement('ul');

        for (let j = 0; j < teamArrays[i].length; j++) {
            const listItem = document.createElement('li');
            listItem.innerText = teamArrays[i][j];
            teamList.appendChild(listItem);
        }

        teamDiv.appendChild(teamList);
        resultsDiv.appendChild(teamDiv);
    }
    // Create a CSV string with the results
    let csvData = 'ID,Team\n';
    for (let i = 0; i < studentIds.length; i++) {
        for (let j = 0; j < teams.length; j++) {
            if (teams[i][j] === 1) {
                csvData += `${studentIds[i]},${j + 1}\n`;
                break;
            }
        }
    }


    // Add an event listener to the export button
    const exportBtn = document.getElementById('export-btn');
    exportBtn.csvData = csvData;
    exportBtn.style.display = 'block'; // Show the export button
    exportBtn.onclick = function () {
        // Create a temporary link element to download the CSV file
        const link = document.createElement('a');
        link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(this.csvData);
        link.download = 'teams.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
}                   
function resetForm() {
    document.getElementById('num-teams').value = '';
    document.getElementById('file-upload').value = '';
    document.getElementById('manual-input').value = '';
    document.getElementById('results').innerHTML = '';
    document.getElementById('export-btn').style.display = 'none';
    displayResultsCalled = false; // Reset the displayResultsCalled variable
}
