// Script pour le diaporama de la page d'accueil (robuste si éléments absents)
let slideIndex = 1;

// Initialisation du diaporama au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    const slides = document.getElementsByClassName('hero-slide');
    const dots = document.getElementsByClassName('dot');

    // Ne rien faire si aucun slide n'est présent
    if (!slides || slides.length === 0) {
        return;
    }

    // Afficher la première diapositive
    showSlides(slideIndex);

    // Démarrer le diaporama automatique uniquement s'il y a au moins 2 slides
    if (slides.length > 1) {
        setInterval(function() {
            plusSlides(1);
        }, 8000); // Change d'image toutes les 8 secondes
    }
});

// Navigation entre les diapositives (précédent/suivant)
function plusSlides(n) {
    showSlides(slideIndex += n);
}

// Contrôle direct des diapositives
function currentSlide(n) {
    showSlides(slideIndex = n);
}

// Affichage des diapositives
function showSlides(n) {
    let i;
    const slides = document.getElementsByClassName('hero-slide');
    const dots = document.getElementsByClassName('dot');

    const slidesLen = slides ? slides.length : 0;
    const dotsLen = dots ? dots.length : 0;

    if (slidesLen === 0) {
        return;
    }

    // Boucle circulaire
    if (n > slidesLen) { slideIndex = 1; }
    if (n < 1) { slideIndex = slidesLen; }

    // Désactiver toutes les diapositives (garde classe si classList indisponible)
    for (i = 0; i < slidesLen; i++) {
        if (slides[i] && slides[i].classList) {
            slides[i].classList.remove('active');
        }
    }

    // Désactiver tous les indicateurs (si présents)
    for (i = 0; i < dotsLen; i++) {
        if (dots[i]) {
            dots[i].className = (dots[i].className || '').replace(' active-dot', '');
        }
    }

    // Activer la diapositive actuelle et son indicateur (si présent)
    const currentIdx = slideIndex - 1;
    if (slides[currentIdx] && slides[currentIdx].classList) {
        slides[currentIdx].classList.add('active');
    }
    if (dotsLen > currentIdx && dots[currentIdx]) {
        dots[currentIdx].className = (dots[currentIdx].className || '') + ' active-dot';
    }
}
