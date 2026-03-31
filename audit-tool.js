// Add listeners to instantly load files as soon as they are uploaded
document.getElementById('file1').addEventListener('change', (e) => loadFileImmediately(e, 'pane1-content'));
document.getElementById('file2').addEventListener('change', (e) => loadFileImmediately(e, 'pane2-content'));

// Add listeners for the comparison buttons
document.getElementById('btn-diff').addEventListener('click', () => processFiles('diff'));
document.getElementById('btn-sim').addEventListener('click', () => processFiles('sim'));

// Instantly displays the raw text of the uploaded file
async function loadFileImmediately(event, paneId) {
    const file = event.target.files[0];
    if (!file) return;
    
    const text = await file.text();
    const lines = text.split(/\r?\n/);
    
    let html = '';
    lines.forEach(line => {
        // Preserves empty lines by injecting a non-breaking space if the line is blank
        const displayLine = escapeHTML(line) || '&nbsp;';
        html += `<div class="diff-line">${displayLine}</div>`;
    });
    
    document.getElementById(paneId).innerHTML = html;
}

// Compares the two files based on the button clicked
async function processFiles(mode) {
    const file1 = document.getElementById('file1').files[0];
    const file2 = document.getElementById('file2').files[0];

    if (!file1 || !file2) {
        alert("System Notice: Please upload both Dataset 1 and Dataset 2 to compare.");
        return;
    }

    const text1 = await file1.text();
    const text2 = await file2.text();

    const lines1 = text1.split(/\r?\n/);
    const lines2 = text2.split(/\r?\n/);

    const set1 = new Set(lines1);
    const set2 = new Set(lines2);

    let html1 = '';
    let html2 = '';

    // Analyze Dataset 1
    lines1.forEach(line => {
        const displayLine = escapeHTML(line) || '&nbsp;';
        
        if (mode === 'diff') {
            if (line !== "" && !set2.has(line)) html1 += `<div class="diff-line diff-red">${displayLine}</div>`;
            else html1 += `<div class="diff-line diff-muted">${displayLine}</div>`;
        } else if (mode === 'sim') {
            if (line !== "" && set2.has(line)) html1 += `<div class="diff-line diff-green">${displayLine}</div>`;
            else html1 += `<div class="diff-line diff-muted">${displayLine}</div>`;
        }
    });

    // Analyze Dataset 2
    lines2.forEach(line => {
        const displayLine = escapeHTML(line) || '&nbsp;';
        
        if (mode === 'diff') {
            if (line !== "" && !set1.has(line)) html2 += `<div class="diff-line diff-red">${displayLine}</div>`;
            else html2 += `<div class="diff-line diff-muted">${displayLine}</div>`;
        } else if (mode === 'sim') {
            if (line !== "" && set1.has(line)) html2 += `<div class="diff-line diff-green">${displayLine}</div>`;
            else html2 += `<div class="diff-line diff-muted">${displayLine}</div>`;
        }
    });

    document.getElementById('pane1-content').innerHTML = html1;
    document.getElementById('pane2-content').innerHTML = html2;
}

// Security function to prevent HTML injection
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag] || tag));
}