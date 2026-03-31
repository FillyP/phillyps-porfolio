function runCalculator() {
    // Grab the numbers and the operator from the website inputs
    const num1 = parseFloat(document.getElementById('calc-num1').value) || 0;
    const num2 = parseFloat(document.getElementById('calc-num2').value) || 0;
    const op = document.getElementById('calc-op').value;
    const outputDiv = document.getElementById('calc-output');
    
    let result = 0;
    
    // Perform the math based on the selected operator
    if (op === '+') {
        result = num1 + num2;
    } else if (op === '-') {
        result = num1 - num2;
    } else if (op === '*') {
        result = num1 * num2;
    } else if (op === '/') {
        if (num2 === 0) {
            result = "Error: Cannot divide by zero";
        } else {
            result = num1 / num2;
        }
    }
    
    // Display the result on the website and remove the 'hidden' class
    outputDiv.innerText = `Result: ${result}`;
    outputDiv.classList.remove('hidden');
}