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
    const numTeams = parseInt(document.getElementById('num-teams').value);

    // Call the SynTeamPlus function with the proficiencies and number of teams
    const teamsMatrix = synTeamPlus({ prof: proficiencies }, numTeams);

    // Process the results directly
    displayResults(teamsMatrix, studentIds);
}

function displayResults(teamsMatrix, studentIds) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    const numTeams = teamsMatrix[0].length;
    let teamArrays = Array.from({ length: numTeams }, () => []);

    teamsMatrix.forEach((team, studentIndex) => {
        const teamIndex = team.indexOf(1);
        teamArrays[teamIndex].push(studentIds[studentIndex]);
    });

    teamArrays.forEach((team, index) => {
        const teamDiv = document.createElement('div');
        teamDiv.className = 'team';

        const teamHeading = document.createElement('h3');
        teamHeading.innerText = `Team ${index + 1}`;
        teamDiv.appendChild(teamHeading);

        const teamList = document.createElement('ul');
        team.forEach(studentId => {
            const listItem = document.createElement('li');
            listItem.innerText = studentId;
            teamList.appendChild(listItem);
        });

        teamDiv.appendChild(teamList);
        resultsDiv.appendChild(teamDiv);
    });
    
    const csvData = generateCSV(teamsMatrix, studentIds);

    const downloadLink = document.createElement('a');
    downloadLink.href = csvData;
    downloadLink.download = 'teams.csv';
    downloadLink.textContent = 'Download Results as CSV';
    downloadLink.className = 'download-csv-link';

    resultsDiv.appendChild(downloadLink);
}

function resetForm() {
    document.getElementById('num-teams').value = '';
    document.getElementById('file-upload').value = '';
    document.getElementById('manual-input').value = '';
    document.getElementById('results').innerHTML = '';
    document.getElementById('export-btn').style.display = 'none';
    displayResultsCalled = false; 
}

function generateCSV(teamsMatrix, studentIds) {
    let csvContent = "data:text/csv;charset=utf-8,";

    csvContent += "Name or ID,Team Number\n";

    teamsMatrix.forEach((team, studentIndex) => {
        const teamIndex = team.indexOf(1) + 1;
        csvContent += `${studentIds[studentIndex]},${teamIndex}\n`;
    });

    return encodeURI(csvContent);
}

