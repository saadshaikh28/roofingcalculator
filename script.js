// Constants
const PRICES = {
    asphalt: 4.5,
    metal: 9,
    tile: 12,
    flat: 6
};

// Urgency Multipliers
const URGENCY = {
    normal: 1.0,
    soon: 1.15,
    emergency: 1.35
};

const PHONE_NUMBER = "1234567890"; // Placeholder

// DOM Elements
const form = document.getElementById('roofingForm');
const sizeInput = document.getElementById('roofSize');
const sizeVal = document.getElementById('roofSizeVal');
const typeInput = document.getElementById('roofType');
const urgencyInput = document.getElementById('urgency');
const zipInput = document.getElementById('zipcode');

const priceMinEl = document.getElementById('priceMin');
const priceMaxEl = document.getElementById('priceMax');
const waBtn = document.getElementById('waBtn');
const smsBtn = document.getElementById('smsBtn');

// State
let state = {
    size: 2000,
    type: 'asphalt',
    urgency: 'normal',
    zipcode: ''
};

// Initialize
function init() {
    addEventListeners();
    updateCalculation();
}

function addEventListeners() {
    sizeInput.addEventListener('input', (e) => {
        state.size = parseInt(e.target.value);
        sizeVal.textContent = state.size;
        updateCalculation();
    });

    typeInput.addEventListener('change', (e) => {
        state.type = e.target.value;
        updateCalculation();
    });

    urgencyInput.addEventListener('change', (e) => {
        state.urgency = e.target.value;
        updateCalculation();
    });

    zipInput.addEventListener('input', (e) => {
        state.zipcode = e.target.value;
        // Optional: Update links if zip is needed in message
    });
}

function updateCalculation() {
    // 1. Calculate Base
    const baseRate = PRICES[state.type];
    const urgencyMult = URGENCY[state.urgency];

    const exactTotal = state.size * baseRate * urgencyMult;

    // 2. Calculate Range (+/- 12%)
    const minPrice = exactTotal * 0.88;
    const maxPrice = exactTotal * 1.12;

    // 3. Update Display
    priceMinEl.textContent = formatCurrency(minPrice);
    priceMaxEl.textContent = formatCurrency(maxPrice);

    // 4. Update CTA Links
    updateLinks(minPrice, maxPrice);
}

function formatCurrency(num) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(num);
}

function updateLinks(min, max) {
    const rangeStr = `${formatCurrency(min)} - ${formatCurrency(max)}`;
    const typeStr = typeInput.options[typeInput.selectedIndex].text;
    const urgencyStr = urgencyInput.options[urgencyInput.selectedIndex].text;

    const message = `Roofing Estimate
Name: {name}
Size: ${state.size} sq ft
Type: ${typeStr}
Urgency: ${urgencyStr}
Estimate: ${rangeStr}`;

    const encodedMsg = encodeURIComponent(message);

    // WhatsApp
    waBtn.href = `https://wa.me/${PHONE_NUMBER}?text=${encodedMsg}`;

    // SMS
    // Note: 'body' is standard for SMS URI, but support varies (some use ?)
    smsBtn.href = `sms:${PHONE_NUMBER}?&body=${encodedMsg}`;
}

// Run
init();
