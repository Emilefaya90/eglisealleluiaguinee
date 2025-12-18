// Ce fichier contient le code pour associer les boutons d'action aux fonctions correspondantes

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation des gestionnaires d\'événements pour les boutons d\'action');
    
    // Fonction pour attacher les gestionnaires d'événements aux boutons
    function attachEventHandlers() {
        // Associer les boutons "Voir détails" à la fonction showPasteurDetails
        document.querySelectorAll('.view-pasteur').forEach(function(button) {
            button.addEventListener('click', function() {
                const pasteurId = this.getAttribute('data-id');
                console.log('Bouton Voir détails cliqué pour le pasteur ID:', pasteurId);
                showPasteurDetails(pasteurId);
            });
        });

        // Associer les boutons "Modifier" à la fonction loadPasteurForEdit
        document.querySelectorAll('.edit-pasteur').forEach(function(button) {
            button.addEventListener('click', function() {
                const pasteurId = this.getAttribute('data-id');
                console.log('Bouton Modifier cliqué pour le pasteur ID:', pasteurId);
                loadPasteurForEdit(pasteurId);
            });
        });

        // Associer les boutons "Supprimer" à la fonction confirmDeletePasteur
        document.querySelectorAll('.delete-pasteur').forEach(function(button) {
            button.addEventListener('click', function() {
                const pasteurId = this.getAttribute('data-id');
                console.log('Bouton Supprimer cliqué pour le pasteur ID:', pasteurId);
                confirmDeletePasteur(pasteurId);
            });
        });
    }
    
    // Attacher les gestionnaires d'événements immédiatement
    attachEventHandlers();
    
    // Réattacher les gestionnaires après un chargement AJAX (si nécessaire)
    // Cette partie peut être utile si le tableau est rechargé dynamiquement
    document.addEventListener('DOMNodeInserted', function(e) {
        if (e.target.classList && e.target.classList.contains('pasteur-row')) {
            attachEventHandlers();
        }
    });
});

// Fonction pour confirmer la suppression d'un pasteur
function confirmDeletePasteur(pasteurId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce pasteur ?')) {
        console.log('Suppression du pasteur ID:', pasteurId);
        
        // Créer un formulaire pour soumettre la demande de suppression
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = window.location.origin + `/delete_pasteur/${pasteurId}/`;
        
        // Ajouter le token CSRF
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = 'csrfmiddlewaretoken';
        csrfInput.value = csrfToken;
        form.appendChild(csrfInput);
        
        // Ajouter le formulaire au document et le soumettre
        document.body.appendChild(form);
        form.submit();
    }
}
