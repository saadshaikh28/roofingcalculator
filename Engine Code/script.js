// Load client config
const CLIENT = "mark"; // later this comes from env var
let CONFIG = null;

fetch(`/configs/${CLIENT}.json`)
  .then(res => res.json())
  .then(config => {
    CONFIG = config;
    applyHeroText();
  });

function applyHeroText() {
  document.getElementById("heroLine1").innerText = CONFIG.hero.line1;
  document.getElementById("heroLine2").innerText = CONFIG.hero.line2;
}

/**
 * ROOFING CALCULATOR PRO
 * - GSAP Animations
 * - 3D Background (Three.js)
 * - Multi-step Logic
 */

// --- CONFIGURATION ---
const PRICES = {
    asphalt: 4.50,
    metal: 9.00,
    tile: 12.00,
    flat: 6.00
};

const SHAPE_MULTIPLIERS = {
    gable: 1.0,
    hip: 1.15, // More waste/labor
    gambrel: 1.25,
    flat: 1.0
};

const URGENCY_MULTIPLIERS = {
    normal: 1.0,
    soon: 1.10,
    emergency: 1.30
};

const PHONE_NUMBER = "9987412299";

// State Object
let state = {
    step: 1,
    size: 2000,
    shape: 'gable',
    type: 'asphalt',
    urgency: 'normal',
    zipcode: '',
    extras: {
        tearoff: false,
        gutters: false,
        skylights: false,
        underlayment: false
    }
};

// --- DOM ELEMENTS ---
const progressBar = document.getElementById('progressBar');
const dots = document.querySelectorAll('.step-dot');
const steps = document.querySelectorAll('.wizard-step');
const roofSizeInput = document.getElementById('roofSize');
const roofSizeVal = document.getElementById('roofSizeVal');
const shapeOptions = document.querySelectorAll('.shape-option');
const extrasInputs = document.querySelectorAll('.toggle-switch input');
const floatingCTA = document.getElementById('floatingCTA');

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
    initGSAP();
    initEventListeners();
    updateUI();
});

// --- 3D BACKGROUND (Three.js) ---
function initThreeJS() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Create a mesh (Icosahedron for geometric look)
    const geometry = new THREE.IcosahedronGeometry(10, 1);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0x1E293B, 
        wireframe: true,
        transparent: true,
        opacity: 0.1
    });
    
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 300; // Lightweight
    const posArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 50;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.15,
        color: 0xF59E0B,
        transparent: true,
        opacity: 0.5
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    camera.position.z = 15;

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);
        sphere.rotation.x += 0.001;
        sphere.rotation.y += 0.001;
        particlesMesh.rotation.y -= 0.0005;
        
        // Gentle float
        sphere.position.y = Math.sin(Date.now() * 0.0005) * 1;
        
        renderer.render(scene, camera);
    }
    animate();

    // Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// --- GSAP ANIMATIONS ---
function initGSAP() {
    gsap.registerPlugin(ScrollTrigger);

    // Hero Text Animation
    const tl = gsap.timeline();
    tl.from(".hero-title .line", {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power4.out"
    })
    .from(".subtitle", {
        y: 20,
        opacity: 0,
        duration: 0.8
    }, "-=0.5")
    .from(".hero-cta", {
        scale: 0.9,
        opacity: 0,
        duration: 0.5
    }, "-=0.3")
    .from(".calculator-card", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "back.out(1.7)"
    }, "-=0.3");

    // Sticky Footer Logic
    ScrollTrigger.create({
        trigger: "#hero",
        start: "bottom center",
        onEnter: () => floatingCTA.classList.add('visible'),
        onLeaveBack: () => floatingCTA.classList.remove('visible')
    });
}

// --- WIZARD LOGIC ---
function initEventListeners() {
    
    // Slider Logic
    roofSizeInput.addEventListener('input', (e) => {
        state.size = parseInt(e.target.value);
        roofSizeVal.innerText = state.size;
        
        // Micro-animation for number
        gsap.to(roofSizeVal, {
            scale: 1.2,
            duration: 0.1,
            yoyo: true,
            repeat: 1
        });
    });

    // Shape Selection
    shapeOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            // Remove active class
            shapeOptions.forEach(o => o.classList.remove('selected'));
            // Add active class
            opt.classList.add('selected');
            state.shape = opt.dataset.value;
            
            // Animation
            gsap.fromTo(opt, { scale: 0.95 }, { scale: 1, duration: 0.3, ease: "elastic.out(1, 0.5)" });
        });
    });

    // Inputs
    document.getElementById('roofType').addEventListener('change', (e) => state.type = e.target.value);
    document.getElementById('urgency').addEventListener('change', (e) => state.urgency = e.target.value);
    document.getElementById('zipcode').addEventListener('input', (e) => state.zipcode = e.target.value);

    // Extras Toggles
    extrasInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const key = e.target.id.replace('extra', '').toLowerCase();
            state.extras[key] = e.target.checked;
        });
    });

    // Navigation Buttons
    document.querySelectorAll('.next-btn').forEach(btn => {
        btn.addEventListener('click', () => nextStep());
    });

    document.querySelectorAll('.prev-btn').forEach(btn => {
        btn.addEventListener('click', () => prevStep());
    });

    // DOT NAVIGATION: Allow clicking dots to go back
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            const targetStep = index + 1;
            // Only allow navigating to previous steps or the current step
            if (targetStep < state.step) {
                goToStep(targetStep);
            }
        });
    });
}

function nextStep() {
    if (validateStep(state.step)) {
        if (state.step < 5) {
            state.step++;
            updateUI();
        }
        if (state.step === 5) {
            calculateFinal();
        }
    } else {
        // Shake animation for error
        gsap.to(`.wizard-step[data-step="${state.step}"]`, { x: 10, duration: 0.1, yoyo: true, repeat: 5 });
    }
}

function prevStep() {
    if (state.step > 1) {
        state.step--;
        updateUI();
    }
}

// Helper to jump to specific step
function goToStep(stepNumber) {
    state.step = stepNumber;
    updateUI();
}

function nextStep() {
    if (validateStep(state.step)) {
        if (state.step < 5) {
            state.step++;
            updateUI();
        }
        if (state.step === 5) {
            calculateFinal();
        }
    } else {
        // Shake animation for error
        gsap.to(`.wizard-step[data-step="${state.step}"]`, { x: 10, duration: 0.1, yoyo: true, repeat: 5 });
    }
}

function prevStep() {
    if (state.step > 1) {
        state.step--;
        updateUI();
    }
}

function validateStep(step) {
    if (step === 3) {
        // Basic Zip Validation
        return state.zipcode.length >= 5;
    }
    return true;
}

function updateUI() {
    // 1. Update Progress Bar
    const progress = ((state.step - 1) / 4) * 100;
    progressBar.style.width = `${progress}%`;

    // 2. Update Dots
    dots.forEach((dot, idx) => {
        const stepNum = idx + 1;
        
        // Reset classes
        dot.classList.remove('active', 'completed');
        
        if (stepNum === state.step) {
            dot.classList.add('active');
        } else if (stepNum < state.step) {
            // Add 'completed' class to previous steps so we can style them as clickable
            dot.classList.add('completed');
        }
    });

    // 3. Show Active Step (with GSAP fade)
    steps.forEach(s => {
        s.classList.remove('active');
        if (parseInt(s.dataset.step) === state.step) {
            s.classList.add('active');
            
            // Re-run animation for the new step
            gsap.fromTo(s, 
                { opacity: 0, y: 10 }, 
                { opacity: 1, y: 0, duration: 0.4, clearProps: "all" }
            );
        }
    });
}

function scrollToCalculator() {
    document.getElementById('calculator').scrollIntoView({ behavior: 'smooth' });
}

// --- CALCULATION LOGIC ---
function calculateFinal() {
    // Base Cost
    const baseRate = PRICES[state.type];
    const shapeMult = SHAPE_MULTIPLIERS[state.shape];
    const urgencyMult = URGENCY_MULTIPLIERS[state.urgency];
    
    let total = state.size * baseRate * shapeMult * urgencyMult;

    // Extras
    if (state.extras.tearoff) total += (state.size * 1.50); // $1.50 per sqft
    if (state.extras.underlayment) total += (state.size * 0.50);
    
    // Fixed extras
    const guttersCost = document.getElementById('extraGutters').dataset.cost;
    const skylightsCost = document.getElementById('extraSkylights').dataset.cost;
    
    if (state.extras.gutters) total += parseInt(guttersCost);
    if (state.extras.skylights) total += parseInt(skylightsCost); // Assuming 1 for simplicity, normally count * cost

    // Range (+/- 10%)
    const min = Math.floor(total * 0.9);
    const max = Math.ceil(total * 1.1);

    // Animate Numbers
    animateValue(document.getElementById('priceMin'), 0, min, 1500);
    animateValue(document.getElementById('priceMax'), 0, max, 1500);

    updateContactLinks(min, max);
}

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        obj.innerHTML = formatCurrency(value);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function formatCurrency(num) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(num);
}

function updateContactLinks(min, max) {
    const minStr = formatCurrency(min);
    const maxStr = formatCurrency(max);
    
    const message = `Hello, I'd like a roofing estimate.
    
    Details:
    - Size: ${state.size} sqft
    - Shape: ${state.shape}
    - Material: ${state.type}
    - Location: ${state.zipcode}
    - Estimate Range: ${minStr} - ${maxStr}
    
    Please contact me to confirm.`;

    const encoded = encodeURIComponent(message);
    document.getElementById('waBtn').href = `https://wa.me/${PHONE_NUMBER}?text=${encoded}`;
    document.getElementById('smsBtn').href = `sms:${PHONE_NUMBER}?&body=${encoded}`;
}