// script.js
const form = document.getElementById('converter-form');
const valueInput = document.getElementById('value');
const fromSelect = document.getElementById('from');
const toSelect = document.getElementById('to');
const resultDiv = document.getElementById('result');
const resultOutput = document.getElementById('result-output');
const equationP = document.getElementById('equation');
const errorDiv = document.getElementById('error');
const swapBtn = document.getElementById('swap');
const clearBtn = document.getElementById('clear');

// Helper: round to sensible digits (max 6, remove trailing zeros)
function formatNumber(n){
  if (!isFinite(n)) return 'Invalid';
  // show integer without decimals
  if (Math.abs(n - Math.round(n)) < 1e-9) return String(Math.round(n));
  // else round to up to 6 decimals, trim trailing zeros
  return parseFloat(n.toFixed(6)).toString();
}

// Conversion functions (work via Celsius as an intermediate)
function toCelsius(value, from){
  // value is number
  if (from === 'C') return value;
  if (from === 'F') return (value - 32) * 5 / 9;
  if (from === 'K') return value - 273.15;
  throw new Error('Unknown unit: ' + from);
}

function fromCelsius(celsius, to){
  if (to === 'C') return celsius;
  if (to === 'F') return celsius * 9 / 5 + 32;
  if (to === 'K') return celsius + 273.15;
  throw new Error('Unknown unit: ' + to);
}

// Clear UI helpers
function showError(msg){
  errorDiv.hidden = false;
  errorDiv.textContent = msg;
  resultDiv.hidden = true;
}
function clearError(){
  errorDiv.hidden = true;
  errorDiv.textContent = '';
}
function showResult(output, eqn){
  resultDiv.hidden = false;
  resultOutput.textContent = output;
  equationP.textContent = eqn || '';
  clearError();
}
function clearAll(){
  valueInput.value = '';
  fromSelect.value = 'C';
  toSelect.value = 'F';
  resultDiv.hidden = true;
  equationP.textContent = '';
  clearError();
}

// Convert handler
form.addEventListener('submit', (e) => {
  e.preventDefault();
  clearError();

  const raw = valueInput.value.trim();
  if (raw === '') {
    showError('Please enter a numeric value to convert.');
    valueInput.focus();
    return;
  }
  const value = Number(raw);
  if (!isFinite(value)) {
    showError('Please enter a valid finite number.');
    valueInput.focus();
    return;
  }

  const from = fromSelect.value;
  const to = toSelect.value;

  if (from === to) {
    // same units: simple echo
    const output = formatNumber(value) + ` ${unitLabel(to)}`;
    showResult(output, 'No conversion required; units are identical.');
    return;
  }

  // Convert via Celsius intermediate
  try {
    const c = toCelsius(value, from);
    const converted = fromCelsius(c, to);
    const formatted = `${formatNumber(converted)} ${unitLabel(to)}`;
    // Provide a short equation string for clarity
    const eqn = equationString(value, from, converted, to);
    showResult(formatted, eqn);
  } catch (err) {
    showError('Conversion error: ' + err.message);
  }
});

// Swap button: swap units and keep value if possible
swapBtn.addEventListener('click', () => {
  const fromVal = fromSelect.value;
  const toVal = toSelect.value;
  fromSelect.value = toVal;
  toSelect.value = fromVal;
  // If result is visible and conversion gave a numeric, set input to result numeric (stripped)
  if (!resultDiv.hidden) {
    // Try to parse existing resultOutput
    const text = resultOutput.textContent || '';
    const num = parseFloat(text);
    if (isFinite(num)) {
      valueInput.value = num;
    }
  }
  valueInput.focus();
});

// Clear button
clearBtn.addEventListener('click', clearAll);

// Utility labels
function unitLabel(unit){
  if (unit === 'C') return '°C';
  if (unit === 'F') return '°F';
  if (unit === 'K') return 'K';
  return unit;
}

// Equation builder for user info
function equationString(input, from, out, to){
  // show the key formula used (converted via Celsius)
  // Display with rounded numbers for readability
  const inp = formatNumber(input) + ' ' + unitLabel(from);
  const outp = formatNumber(out) + ' ' + unitLabel(to);

  // Build friendly sentence with math (not exact algebra)
  if (from === 'C' && to === 'F') {
    return `${inp} → ${outp} (F = C × 9/5 + 32)`;
  }
  if (from === 'C' && to === 'K') {
    return `${inp} → ${outp} (K = C + 273.15)`;
  }
  if (from === 'F' && to === 'C') {
    return `${inp} → ${outp} (C = (F − 32) × 5/9)`;
  }
  if (from === 'F' && to === 'K') {
    return `${inp} → ${outp} (K = (F − 32) × 5/9 + 273.15)`;
  }
  if (from === 'K' && to === 'C') {
    return `${inp} → ${outp} (C = K − 273.15)`;
  }
  if (from === 'K' && to === 'F') {
    return `${inp} → ${outp} (F = (K − 273.15) × 9/5 + 32)`;
  }
  // default minimal
  return `${inp} → ${outp}`;
}
