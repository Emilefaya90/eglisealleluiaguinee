// Script pour la navigation mobile et interactions
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    let isMobile = window.innerWidth <= 768;

    // Fonction pour fermer tous les menus déroulants sauf celui spécifié
    function closeOtherDropdowns(currentDropdown) {
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            if (dropdown !== currentDropdown) {
                dropdown.classList.remove('show');
                const menu = dropdown.querySelector('.dropdown-menu');
                if (menu) {
                    menu.classList.remove('show');
                }
            }
        });
    }

    // Gestion du redimensionnement de la fenêtre
    function handleResize() {
        isMobile = window.innerWidth <= 768;
        if (!isMobile) {
            // Sur desktop, on s'assure que le menu mobile est fermé
            if (hamburger && navMenu) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
            // On ferme tous les menus déroulants
            document.querySelectorAll('.dropdown').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    }

    // Toggle menu mobile
    function toggleMobileMenu() {
        if (hamburger && navMenu) {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        }
    }

    // Gestion des clics en dehors des menus
    function handleOutsideClick(e) {
        if (!e.target.closest('.nav-menu') && !e.target.closest('.hamburger')) {
            // Fermer le menu mobile
            if (hamburger && navMenu) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
            // Fermer les menus déroulants
            document.querySelectorAll('.dropdown').forEach(dropdown => {
                if (!dropdown.contains(e.target)) {
                    dropdown.classList.remove('show');
                    const menu = dropdown.querySelector('.dropdown-menu');
                    if (menu) {
                        menu.classList.remove('show');
                    }
                }
            });
        }
    }

    // Gestion des menus déroulants
    function setupDropdowns() {
        dropdownToggles.forEach(toggle => {
            // Pour les menus déroulants normaux (pas le sélecteur de langue)
            if (!toggle.closest('.language-selector')) {
                toggle.addEventListener('click', function(e) {
                    const dropdown = this.closest('.dropdown');
                    if (!dropdown) return;

                    if (isMobile) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Fermer les autres menus déroulants
                        closeOtherDropdowns(dropdown);
                        
                        // Basculer le menu actuel
                        dropdown.classList.toggle('show');
                        const menu = dropdown.querySelector('.dropdown-menu');
                        if (menu) {
                            menu.classList.toggle('show');
                        }
                    } else {
                        // Sur desktop, on laisse le hover gérer
                        e.stopPropagation();
                    }
                });
            }
        });
    }

    // Fermer le menu mobile quand on clique sur un lien
    function setupNavLinks() {
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (hamburger && navMenu) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                }
                
                // Fermer les autres menus déroulants
                dropdownToggles.forEach(otherToggle => {
                    if (otherToggle !== this && !otherToggle.closest('.language-selector')) {
                        const otherDropdown = otherToggle.closest('.dropdown');
                        if (otherDropdown) {
                            otherDropdown.classList.remove('active');
                            otherDropdown.classList.remove('show');
                            const menu = otherDropdown.querySelector('.dropdown-menu');
                            if (menu) {
                                menu.classList.remove('show');
                            }
                        }
                    }
                });
            });
        });
    }

    // Initialisation des événements
    function init() {
        // Menu hamburger
        if (hamburger) {
            hamburger.addEventListener('click', toggleMobileMenu);
        }

        // Redimensionnement
        window.addEventListener('resize', handleResize);

        // Clics en dehors des menus
        document.addEventListener('click', handleOutsideClick);

        // Configuration des menus déroulants
        setupDropdowns();

        // Configuration des liens de navigation
        setupNavLinks();

        // Configuration des sous-menus déroulants
        setupSubmenus();

        // Animation au scroll (optionnel)
        window.addEventListener('scroll', function() {
            const navbar = document.querySelector('.navbar');
            if (navbar) {
                if (window.scrollY > 50) {
                    navbar.style.backgroundColor = 'rgba(44, 62, 80, 0.95)';
                    navbar.style.backdropFilter = 'blur(10px)';
                } else {
                    navbar.style.backgroundColor = '#2c3e50';
                    navbar.style.backdropFilter = 'none';
                }
            }
        });
    }

    // Gestion des sous-menus déroulants
    function setupSubmenus() {
        const submenus = document.querySelectorAll('.dropdown-submenu');
        
        submenus.forEach(submenu => {
            const toggle = submenu.querySelector('.dropdown-toggle');
            const menu = submenu.querySelector('.dropdown-menu');
            
            if (toggle && menu) {
                // Sur mobile, gérer le clic
                toggle.addEventListener('click', function(e) {
                    if (isMobile) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Basculer l'affichage du sous-menu
                        const isVisible = menu.style.display === 'block';
                        
                        // Fermer tous les autres sous-menus
                        document.querySelectorAll('.dropdown-submenu .dropdown-menu').forEach(otherMenu => {
                            if (otherMenu !== menu) {
                                otherMenu.style.display = 'none';
                            }
                        });
                        
                        // Basculer le menu actuel
                        menu.style.display = isVisible ? 'none' : 'block';
                    }
                });
                
                // Sur desktop, gérer le hover
                if (!isMobile) {
                    submenu.addEventListener('mouseenter', function() {
                        menu.style.display = 'block';
                    });
                    
                    submenu.addEventListener('mouseleave', function() {
                        menu.style.display = 'none';
                    });
                }
            }
        });
    }

    // Initialisation
    init();
});
