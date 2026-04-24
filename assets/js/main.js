window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => { preloader.style.display = 'none'; }, 500);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');

    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            if (mobileMenu.classList.contains('hidden')) {
                menuIcon.classList.replace('ph-x', 'ph-list');
            } else {
                menuIcon.classList.replace('ph-list', 'ph-x');
            }
        });
    }

    // Scroll Reveal
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    revealElements.forEach(el => revealObserver.observe(el));
});

// --- Active Link Highlight Logic ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Current page ka URL pata lagao
    const currentLocation = location.href;

    // 2. Navbar ke sabhi links ko select karo
    const navLinks = document.querySelectorAll('nav a');

    // 3. Har link ko check karo
    navLinks.forEach(link => {
        // Agar link ka raasta current page se match karta hai
        if (link.href === currentLocation) {
            // Toh usme Cyan color add kar do aur Gray color hata do
            link.classList.remove('text-gray-400', 'hover:text-white');
            link.classList.add('text-[#22d3ee]');
        }
    });
});


// --- ADMISSION FORM LOGIC (GOOGLE SHEETS & EMAIL) ---
const admissionForm = document.getElementById('admissionForm');
const formMessage = document.getElementById('formMessage');
const submitBtn = document.getElementById('submitBtn');

// 👇 यहाँ अपना वो Web App URL पेस्ट करें जो आपने Step 3 में कॉपी किया था 👇
const scriptURL = 'https://script.google.com/macros/s/AKfycbxmLFd9i1Up4AUwqR9O0EPA6690BBJMrbu4_cUU9qaHHiEv-_W3VhApZMIKkDzm-lRC/exec';

if (admissionForm) {
    admissionForm.addEventListener('submit', function (e) {
        e.preventDefault(); // Page refresh रोकना

        // 1. Button Loading State
        const btnText = submitBtn.querySelector('strong');
        const originalText = btnText.innerText;
        btnText.innerText = "SUBMITTING...";
        submitBtn.style.pointerEvents = "none";
        submitBtn.style.opacity = "0.7";

        // 2. Hide previous messages
        formMessage.classList.add('hidden');
        formMessage.className = 'hidden p-4 rounded-xl text-sm font-medium border transition-all duration-300';

        // 3. Form का सारा डेटा इकट्ठा करना
        const formData = new FormData();
        formData.append('studentName', document.getElementById('studentName').value);
        formData.append('dob', document.getElementById('dob').value);
        formData.append('gender', document.getElementById('gender').value);
        formData.append('className', document.getElementById('className').value);
        formData.append('fatherName', document.getElementById('fatherName').value);
        formData.append('mobile', document.getElementById('mobile').value);
        formData.append('email', document.getElementById('email').value);
        formData.append('address', document.getElementById('address').value);

        // 4. Data को Google Sheet (Web App) पर भेजना
        fetch(scriptURL, { method: 'POST', body: formData })
            .then(response => {
                // Show Success Message
                formMessage.classList.remove('hidden');
                formMessage.classList.add('bg-green-500/10', 'text-green-400', 'border-green-500/30');
                formMessage.innerHTML = `<i class="ph-fill ph-check-circle text-lg inline-block align-middle mr-2"></i> Application Submitted! We will contact you soon.`;

                admissionForm.reset(); // फॉर्म खाली करना

                // Reset Button
                btnText.innerText = originalText;
                submitBtn.style.pointerEvents = "auto";
                submitBtn.style.opacity = "1";

                // 5 सेकंड बाद मैसेज गायब करना
                setTimeout(() => formMessage.classList.add('hidden'), 5000);
            })
            .catch(error => {
                // Show Error Message
                formMessage.classList.remove('hidden');
                formMessage.classList.add('bg-red-500/10', 'text-red-400', 'border-red-500/30');
                formMessage.innerHTML = `<i class="ph-fill ph-warning-circle text-lg inline-block align-middle mr-2"></i> Error submitting form. Please try again or call us.`;

                btnText.innerText = originalText;
                submitBtn.style.pointerEvents = "auto";
                submitBtn.style.opacity = "1";
                console.error('Error!', error.message);
            });
    });
}