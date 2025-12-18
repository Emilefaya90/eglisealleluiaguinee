// Script pour le formulaire de newsletter moderne
document.addEventListener('DOMContentLoaded', function() {
    // Éléments du formulaire
    const newsletterForm = document.getElementById('newsletter-form');
    const successMessage = document.querySelector('.success-message');
    const resetFormButton = document.getElementById('reset-form');
    
    // Éléments pour afficher/masquer le modal
    const showNewsletterBtn = document.getElementById('show-newsletter-btn');
    const closeNewsletterBtn = document.getElementById('close-newsletter-btn');
    const newsletterModal = document.getElementById('newsletter-modal');
    
    // Afficher le modal lorsqu'on clique sur le bouton d'inscription
    if (showNewsletterBtn && newsletterModal) {
        showNewsletterBtn.addEventListener('click', function() {
            newsletterModal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Empêcher le défilement de la page
        });
    }
    
    // Fermer le modal lorsqu'on clique sur le bouton de fermeture
    if (closeNewsletterBtn && newsletterModal) {
        closeNewsletterBtn.addEventListener('click', function() {
            newsletterModal.style.display = 'none';
            document.body.style.overflow = ''; // Réactiver le défilement de la page
        });
    }
    
    // Fermer le modal lorsqu'on clique en dehors du formulaire
    if (newsletterModal) {
        newsletterModal.addEventListener('click', function(e) {
            if (e.target === newsletterModal) {
                newsletterModal.style.display = 'none';
                document.body.style.overflow = ''; // Réactiver le défilement de la page
            }
        });
    }
    
    if (newsletterForm) {
        // Validation en temps réel des champs
        const fullNameInput = document.getElementById('fullName');
        const emailInput = document.getElementById('email');
        const termsCheck = document.getElementById('termsCheck');
        
        // Fonction pour valider l'email
        function validateEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        }
        
        // Validation du nom complet
        if (fullNameInput) {
            fullNameInput.addEventListener('blur', function() {
                if (fullNameInput.value.trim() === '') {
                    fullNameInput.classList.add('is-invalid');
                } else {
                    fullNameInput.classList.remove('is-invalid');
                    fullNameInput.classList.add('is-valid');
                }
            });
        }
        
        // Validation de l'email
        if (emailInput) {
            emailInput.addEventListener('blur', function() {
                if (!validateEmail(emailInput.value)) {
                    emailInput.classList.add('is-invalid');
                } else {
                    emailInput.classList.remove('is-invalid');
                    emailInput.classList.add('is-valid');
                }
            });
        }
        
        // Validation des conditions
        if (termsCheck) {
            termsCheck.addEventListener('change', function() {
                if (!termsCheck.checked) {
                    termsCheck.classList.add('is-invalid');
                } else {
                    termsCheck.classList.remove('is-invalid');
                    termsCheck.classList.add('is-valid');
                }
            });
        }
        
        // Soumission du formulaire
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Vérifier tous les champs
            let isValid = true;
            
            if (fullNameInput.value.trim() === '') {
                fullNameInput.classList.add('is-invalid');
                isValid = false;
            }
            
            if (!validateEmail(emailInput.value)) {
                emailInput.classList.add('is-invalid');
                isValid = false;
            }
            
            if (!termsCheck.checked) {
                termsCheck.classList.add('is-invalid');
                isValid = false;
            }
            
            if (isValid) {
                // Afficher un message de succès temporaire et fermer le modal
                const tempMessage = document.createElement('div');
                tempMessage.className = 'alert alert-success position-fixed top-50 start-50 translate-middle p-3';
                tempMessage.style.zIndex = '9999';
                tempMessage.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)';
                tempMessage.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i> Merci pour votre inscription!';
                document.body.appendChild(tempMessage);
                
                // Fermer le modal
                if (newsletterModal) {
                    newsletterModal.style.display = 'none';
                    document.body.style.overflow = ''; // Réactiver le défilement
                }
                
                // Supprimer le message après 3 secondes
                setTimeout(() => {
                    document.body.removeChild(tempMessage);
                    
                    // Réinitialiser le formulaire
                    newsletterForm.reset();
                    
                    // Supprimer les classes de validation
                    const formInputs = newsletterForm.querySelectorAll('.form-control');
                    formInputs.forEach(input => {
                        input.classList.remove('is-valid');
                        input.classList.remove('is-invalid');
                    });
                    
                    if (termsCheck) {
                        termsCheck.classList.remove('is-valid');
                        termsCheck.classList.remove('is-invalid');
                    }
                }, 3000);
            }
        });
        
        // Réinitialiser le formulaire
        // Bouton pour revenir au formulaire
        if (resetFormButton) {
            resetFormButton.addEventListener('click', function() {
                // Cacher le message de succès et afficher le formulaire
                successMessage.style.display = 'none';
                newsletterForm.style.display = 'block';
                
                // Réinitialiser le formulaire
                newsletterForm.reset();
                newsletterForm.classList.remove('was-validated');
                
                // Réinitialiser les classes de validation
                const formControls = newsletterForm.querySelectorAll('.form-control');
                formControls.forEach(control => {
                    control.classList.remove('is-valid', 'is-invalid');
                });
                
                termsCheck.classList.remove('is-valid', 'is-invalid');
            });
        }
    }
});
