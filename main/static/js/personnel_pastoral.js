// Fonction pour afficher les détails d'un pasteur dans un modal
function showPasteurDetails(pasteurId) {
    // Faire une requête AJAX pour obtenir les détails du pasteur
    fetch(`/get_pasteur_details/${pasteurId}/`)
        .then(response => response.json())
        .then(resp => {
            if (!resp || resp.success !== true || !resp.data) {
                throw new Error('Réponse invalide du serveur.');
            }
            const data = resp.data;
            // Créer le contenu du modal
            let modalContent = `
                <div class="modal fade" id="pasteurDetailsModal" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header bg-info text-white">
                                <h5 class="modal-title"><i class="fas fa-user me-2"></i> Détails du Pasteur</h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div class="row">
                                    <div class="col-md-4 text-center mb-3">
                                        ${data.photo_url ? 
                                            `<img src="${data.photo_url}" alt="Photo" class="img-fluid rounded-circle" style="max-width: 150px;">` : 
                                            `<div class="bg-secondary rounded-circle d-flex align-items-center justify-content-center mx-auto" style="width: 150px; height: 150px;">
                                                <i class="fas fa-user fa-4x text-white"></i>
                                            </div>`
                                        }
                                    </div>
                                    <div class="col-md-8">
                                        <h4>${data.nom} ${data.prenom}</h4>
                                        <p class="badge bg-primary">${data.fonction}</p>
                                    </div>
                                </div>
                                
                                <div class="row mt-4">
                                    <div class="col-md-6">
                                        <h5 class="border-bottom pb-2">Informations personnelles</h5>
                                        <p><strong>Sexe:</strong> ${data.sexe === 'M' ? 'Masculin' : data.sexe === 'F' ? 'Féminin' : 'Non renseigné'}</p>
                                        <p><strong>Date de naissance:</strong> ${data.date_naissance ? new Date(data.date_naissance).toLocaleDateString() : 'Non renseignée'}</p>
                                        <p><strong>Lieu de naissance:</strong> ${data.lieu_naissance || 'Non renseigné'}</p>
                                        <p><strong>Nationalité:</strong> ${data.nationalite || 'Non renseignée'}</p>
                                        <p><strong>Domicile:</strong> ${data.domicile || 'Non renseigné'}</p>
                                        <p><strong>État civil:</strong> ${data.etat_civil || 'Non renseigné'}</p>
                                        <p><strong>Nombre d'enfants:</strong> ${data.nombre_enfants || '0'}</p>
                                        <p><strong>Profession:</strong> ${data.profession || 'Non renseignée'}</p>
                                        <p><strong>Téléphone:</strong> ${data.telephone || 'Non renseigné'}</p>
                                        <p><strong>Email:</strong> ${data.email || 'Non renseigné'}</p>
                                    </div>
                                    <div class="col-md-6">
                                        <h5 class="border-bottom pb-2">Informations professionnelles</h5>
                                        <p><strong>Église affectée:</strong> ${data.eglise_nom || 'Non affecté'}</p>
                                        <p><strong>Date de consécration:</strong> ${data.date_consecration ? new Date(data.date_consecration).toLocaleDateString() : 'Non renseignée'}</p>
                                        <p><strong>Lieu d'affectation:</strong> ${data.lieu_affectation || 'Non renseigné'}</p>
                                        <p><strong>Date d'affectation:</strong> ${data.date_affectation ? new Date(data.date_affectation).toLocaleDateString() : 'Non renseignée'}</p>
                                        <p><strong>Région:</strong> ${data.region || 'Non renseignée'}</p>
                                        <p><strong>Zone:</strong> ${data.zone || 'Non renseignée'}</p>
                                        <p><strong>Formations:</strong> ${data.types_formations || 'Non renseignées'}</p>
                                        <p><strong>Statut actuel:</strong> ${data.statut_actuel || 'Non renseigné'}</p>
                                    </div>
                                </div>
                                
                                <div class="row mt-4">
                                    <div class="col-12">
                                        <h5 class="border-bottom pb-2">Filiations</h5>
                                        <p><strong>Prénoms du père:</strong> ${data.prenoms_pere || 'Non renseignés'}</p>
                                        <p><strong>Prénoms et nom de la mère:</strong> ${data.prenoms_nom_mere || 'Non renseignés'}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-primary" onclick="loadPasteurForEdit(${pasteurId})" data-bs-dismiss="modal">
                                    <i class="fas fa-edit me-2"></i> Modifier
                                </button>
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                    <i class="fas fa-times me-2"></i> Fermer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Ajouter le modal au document
            const modalContainer = document.createElement('div');
            modalContainer.innerHTML = modalContent;
            document.body.appendChild(modalContainer.firstElementChild);
            
            // Afficher le modal
            const modal = new bootstrap.Modal(document.getElementById('pasteurDetailsModal'));
            modal.show();
            
            // Supprimer le modal du DOM après sa fermeture
            document.getElementById('pasteurDetailsModal').addEventListener('hidden.bs.modal', function() {
                this.remove();
            });
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des détails:', error);
            alert('Impossible de récupérer les détails du pasteur.');
        });
}

// Fonction pour charger les données d'un pasteur dans le formulaire pour modification
function loadPasteurForEdit(pasteurId) {
    // Faire une requête AJAX pour obtenir les données du pasteur
    fetch(`/get_pasteur_details/${pasteurId}/`)
        .then(response => response.json())
        .then(resp => {
            if (!resp || resp.success !== true || !resp.data) {
                throw new Error('Réponse invalide du serveur.');
            }
            const data = resp.data;
            // Ouvrir le modal du formulaire
            const formModal = new bootstrap.Modal(document.getElementById('personnelModal'));
            formModal.show();
            
            // Remplir le formulaire avec les données du pasteur
            document.getElementById('pasteur_id').value = pasteurId;
            document.getElementById('nom').value = data.nom || '';
            document.getElementById('prenoms').value = data.prenom || '';
            document.getElementById('fonction').value = data.fonction || '';
            document.getElementById('sexe').value = data.sexe || '';
            document.getElementById('date_naissance').value = data.date_naissance || '';
            document.getElementById('lieu_naissance').value = data.lieu_naissance || '';
            document.getElementById('nationalite').value = data.nationalite || '';
            document.getElementById('domicile').value = data.domicile || '';
            document.getElementById('etat_civil').value = data.etat_civil || '';
            document.getElementById('nombre_enfants').value = data.nombre_enfants || 0;
            document.getElementById('profession').value = data.profession || '';
            document.getElementById('telephone').value = data.telephone || '';
            document.getElementById('email').value = data.email || '';
            document.getElementById('date_consecration').value = data.date_consecration || '';
            
            // Filiations
            document.getElementById('prenoms_pere').value = data.prenoms_pere || '';
            document.getElementById('prenoms_nom_mere').value = data.prenoms_nom_mere || '';
            
            // Affectation
            if (data.eglise_id) {
                document.getElementById('eglise_affectee').value = data.eglise_id;
            }
            document.getElementById('lieu_affectation').value = data.lieu_affectation || '';
            document.getElementById('date_affectation').value = data.date_affectation || '';
            document.getElementById('region').value = data.region || '';
            document.getElementById('zone').value = data.zone || '';
            
            // Formations
            document.getElementById('types_formations').value = data.types_formations || '';
            document.getElementById('statut_actuel').value = data.statut_actuel || '';
            
            // Afficher la photo si disponible
            if (data.photo_url) {
                const photoPreview = document.getElementById('photoPreview');
                const previewImage = document.getElementById('previewImage');
                const openCameraBtn = document.getElementById('openCameraBtn');
                
                previewImage.src = data.photo_url;
                photoPreview.style.display = 'block';
                openCameraBtn.style.display = 'none';
            }
            
            // Changer le texte du bouton de soumission
            const submitButton = document.querySelector('button[type="submit"]');
            submitButton.innerHTML = '<i class="fas fa-save me-2"></i> Mettre à jour';
            
            // Activer l'onglet Informations personnelles
            document.querySelector('button[data-bs-target="#tab1"]').click();
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des données:', error);
            alert('Erreur lors de la récupération des données du pasteur.');
        });
}

// Fonction pour rechercher dans le tableau
function searchTable() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase();
    const tableRows = document.querySelectorAll('table tbody tr:not(.no-result-row)');
    
    let visibleCount = 0;
    
    tableRows.forEach(row => {
        const textContent = row.textContent.toLowerCase();
        if (textContent.includes(searchTerm)) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // Mettre à jour le compteur
    updatePasteurCount();
}

// Fonction pour mettre à jour le compteur de pasteurs
function updatePasteurCount() {
    const tableRows = document.querySelectorAll('table tbody tr');
    let visibleCount = 0;
    
    tableRows.forEach(row => {
        if (row.style.display !== 'none' && !row.querySelector('td[colspan="9"]')) {
            visibleCount++;
        }
    });
    
    // Mettre à jour le badge de compteur
    const countBadge = document.getElementById('pasteurCount');
    if (countBadge) {
        countBadge.textContent = visibleCount;
    }
    
    // Afficher un message si aucun pasteur n'est visible
    const tbody = document.querySelector('table tbody');
    const noResultRow = document.querySelector('tr.no-result-row');
    
    if (visibleCount === 0) {
        if (!noResultRow) {
            const searchTerm = document.getElementById('searchInput').value.trim();
            const message = searchTerm ? 
                `Aucun résultat trouvé pour "${searchTerm}"` : 
                'Aucun personnel pastoral enregistré pour le moment';
            
            const newRow = 
                '<tr class="no-result-row">' +
                    '<td colspan="9" class="text-center py-3">' + message + '</td>' +
                '</tr>';
            tbody.innerHTML += newRow;
        }
    } else if (noResultRow) {
        noResultRow.remove();
    }
}

// Fonction pour confirmer la suppression d'un pasteur
function confirmDeletePasteur(pasteurId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce pasteur ?')) return;

    // Requête POST vers l'URL Django existante (méthode attendue: POST)
    fetch(`/personnel-pastoral/supprimer/${pasteurId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(async (response) => {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            const data = await response.json();
            if (data.success) {
                const row = document.querySelector(`tr[data-id="${pasteurId}"]`);
                if (row) row.remove();
                updatePasteurCount();
                alert(data.message || 'Suppression effectuée.');
            } else {
                alert(data.error || 'Erreur lors de la suppression.');
            }
            return;
        }
        // Si la vue redirige (comportement actuel), recharger la page
        if (response.redirected) {
            window.location.href = response.url;
            return;
        }
        // Sinon, simple rafraîchissement pour afficher les messages
        window.location.reload();
    })
    .catch(error => {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression du pasteur.');
    });
}

// Fonction utilitaire pour obtenir un cookie
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Initialisation des écouteurs d'événements lorsque le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
    // Bouton Voir tous les Pasteurs
    const voirTousBtn = document.getElementById('voirTousPasteursBtn');
    if (voirTousBtn) {
        voirTousBtn.addEventListener('click', function() {
            window.open('/voir_tous_pasteurs/', '_blank');
        });
    }
    // Recherche dynamique
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(searchTable, 300);
        });
    }

    // Délégation d'événements pour supporter les redraws DataTables
    document.addEventListener('click', function(e) {
        const viewBtn = e.target.closest('.view-pasteur');
        if (viewBtn) {
            const pasteurId = viewBtn.getAttribute('data-id');
            showPasteurDetails(pasteurId);
            return;
        }
        const editBtn = e.target.closest('.edit-pasteur');
        if (editBtn) {
            const pasteurId = editBtn.getAttribute('data-id');
            loadPasteurForEdit(pasteurId);
            return;
        }
        const delBtn = e.target.closest('.delete-pasteur');
        if (delBtn) {
            const pasteurId = delBtn.getAttribute('data-id');
            confirmDeletePasteur(pasteurId);
            return;
        }
    });
});
