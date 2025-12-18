// Validation du formulaire Personnel Pastoral

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form.needs-validation');
    const errorDiv = document.createElement('div');
    errorDiv.id = 'errorMessage';
    errorDiv.className = 'alert alert-danger';
    errorDiv.style.display = 'none';
    errorDiv.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i> Veuillez remplir tous les champs obligatoires.';
    form.parentNode.insertBefore(errorDiv, form);

    form.addEventListener('submit', function(event) {
        // On vérifie tous les champs requis
        let valid = true;
        form.querySelectorAll('[required]').forEach(function(input) {
            if (!input.value || input.value.trim() === '') {
                input.classList.add('is-invalid');
                valid = false;
            } else {
                input.classList.remove('is-invalid');
            }
        });
        if (!valid) {
            event.preventDefault();
            event.stopPropagation();
            errorDiv.style.display = 'block';
            window.scrollTo({top: errorDiv.offsetTop - 100, behavior: 'smooth'});
        } else {
            errorDiv.style.display = 'none';
        }
    }, false);
});
