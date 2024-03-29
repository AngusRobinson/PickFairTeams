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

document.getElementById('toggle-input').addEventListener('click', toggleInput);
document.getElementById('team-form').addEventListener('submit', async (event) => {

    event.preventDefault();

    const numTeams = document.getElementById('num-teams').value;

    const fileUpload = document.getElementById('file-upload').files[0];
    const manualUpload = document.getElementById('manual-input');
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
    const inputText = String(document.getElementById('manual-input').value);
    const lines = inputText.split('\n');

    const proficiencies = [];
    const studentIds = [];

    for (const line of lines) {
        if (line.trim() != '') {
            const separator = line.includes('\t') ? '\t' : ',';
            const columns = line.split(separator);

            studentIds.push(columns[0].trim());
            proficiencies.push(parseFloat(columns[1].trim()));
        }
    }
    let numTeams = document.getElementById('num-teams').value
    document.getElementById('results').innerHTML = getTeamLists(synTeamPlus({"prof": proficiencies},numTeams),studentIds);

}

function processInputFile(file) {
    const reader = new FileReader();

    reader.onload = function (event) {
        const lines = event.target.result.split('\n');

        const proficiencies = [];
        const studentIds = [];

        for (const line of lines) {
            if (line.trim() != '') {
                const columns = line.split(',');

                studentIds.push(columns[0].trim());

                proficiencies.push(parseFloat(columns[1].trim()));
            }
        }
        let numTeams = document.getElementById('num-teams').value
        document.getElementById('results').innerHTML = getTeamLists(synTeamPlus({"prof": proficiencies},numTeams),studentIds);
    };

    reader.readAsText(file);
        
}


function sendFormData(proficiencies, studentIds) {
    let numTeams = parseInt(document.getElementById('num-teams').value);

    let teamsMatrix = synTeamPlus({ prof: proficiencies }, numTeams);
    displayResults(teamsMatrix, studentIds);
}

function displayResults(teamsMatrix, studentIds) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    const table = document.createElement('table');
    table.className = 'results-table';

    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    for (let i = 0; i < teamsMatrix[0].length; i++) {
        const th = document.createElement('th');
        th.textContent = `Team ${i + 1}`;
        headerRow.appendChild(th);
    }

    const maxTeamSize = Math.max(...teamsMatrix.map(team => team.reduce((sum, val) => sum + val, 0)));

    for (let i = 0; i < maxTeamSize; i++) {
        const row = table.insertRow();
        for (let j = 0; j < teamsMatrix[0].length; j++) {
            const cell = row.insertCell();
            const memberIndex = teamsMatrix.findIndex(team => team[j] === 1 && team[0] !== undefined);
            if (memberIndex !== -1) {
                cell.textContent = studentIds[memberIndex];
                teamsMatrix[memberIndex][0] = undefined; // Mark as added
            }
        }
    }

    resultsDiv.appendChild(table);
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
function getTeamLists(PBest, names) {
        const nStudents = names.length;
        const nTeams = PBest[0].length;
        const maxTeamSize = Math.ceil(nStudents / nTeams)
        let teamLists = Array.from(PBest[0],() => [])
        for (let i = 0; i < nStudents; i++) {
            for (let j = 0; j < nTeams; j++) {
                if (PBest[i][j] == 1) {
                    teamLists[j].push(names[i])
                }
            }
        }
        for (let i = 0; i < nTeams; i++) {
            if (teamLists[i].length < maxTeamSize) {
                teamLists[i].push("");
            }
        }
        let teamsTable = '<table id="results-table"><tr>';
        for (let i = 0; i < nTeams; i++) {
            teamsTable += `<th>Team ${i+1}</th>`
        }
        teamsTable += '</tr>';
        for (let i = 0; i < maxTeamSize; i++) {
            teamsTable += '<tr>';
            for (let j = 0; j < nTeams; j++) {
                teamsTable += `<td>${teamLists[j][i]}</td>`;
            }
            teamsTable += '</tr>';
        }
        teamsTable += '</table>';
        return teamsTable;
    }
    
