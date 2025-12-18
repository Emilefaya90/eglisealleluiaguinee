// Fonction corrigée pour afficher les détails d'un pasteur dans un modal
function showPasteurDetails(pasteurId) {
    console.log('Affichage des détails du pasteur ID:', pasteurId);
    
    // Utiliser l'URL complète pour éviter les problèmes de chemin relatif
    const url = window.location.origin + `/get_pasteur_details/${pasteurId}/`;
    console.log('URL de requête:', url);
    
    fetch(url)
        .then(response => {
            console.log('Réponse reçue:', response.status);
            if (!response.ok) {
                throw new Error(`Erreur réseau lors de la récupération des données: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
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
                                        ${data.photo ? 
                                            `<img src="${data.photo}" alt="Photo" class="img-fluid rounded-circle" style="max-width: 150px;">` : 
                                            `<div class="bg-secondary rounded-circle d-flex align-items-center justify-content-center mx-auto" style="width: 150px; height: 150px;">
                                                <i class="fas fa-user fa-4x text-white"></i>
                                            </div>`
                                        }
                                    </div>
                                    <div class="col-md-8">
                                        <h4>${data.nom} ${data.prenom}</h4>
                                        <p class="badge bg-primary">${data.fonction || 'Non spécifié'}</p>
                                    </div>
                                </div>
                                
                                <div class="row mt-4">
                                    <div class="col-md-6">
                                        <h5 class="border-bottom pb-2">Informations personnelles</h5>
                                        <p><strong>Sexe:</strong> ${data.sexe === 'M' ? 'Masculin' : 'Féminin'}</p>
                                        <p><strong>Date de naissance:</strong> ${data.date_naissance ? new Date(data.date_naissance).toLocaleDateString() : 'Non renseigné'}</p>
                                        <p><strong>Téléphone:</strong> ${data.telephone || 'Non renseigné'}</p>
                                        <p><strong>Email:</strong> ${data.email || 'Non renseigné'}</p>
                                    </div>
                                    <div class="col-md-6">
                                        <h5 class="border-bottom pb-2">Informations professionnelles</h5>
                                        <p><strong>Église affectée:</strong> ${data.eglise_nom || 'Non affecté'}</p>
                                        <p><strong>Date d'affectation:</strong> ${data.date_affectation ? new Date(data.date_affectation).toLocaleDateString() : 'Non renseigné'}</p>
                                        <p><strong>Date de consécration:</strong> ${data.date_consecration ? new Date(data.date_consecration).toLocaleDateString() : 'Non renseigné'}</p>
                                    </div>
                                </div>
                                
                                <div class="row mt-3">
                                    <div class="col-md-6">
                                        <h5 class="border-bottom pb-2">Filiations</h5>
                                        <p><strong>Père:</strong> ${data.prenoms_pere || 'Non renseigné'}</p>
                                        <p><strong>Mère:</strong> ${data.prenoms_nom_mere || 'Non renseigné'}</p>
                                    </div>
                                    <div class="col-md-6">
                                        <h5 class="border-bottom pb-2">Statut</h5>
                                        <p><strong>État civil:</strong> ${data.etat_civil || 'Non renseigné'}</p>
                                        <p><strong>Nombre d'enfants:</strong> ${data.nombre_enfants || '0'}</p>
                                        <p><strong>Statut actuel:</strong> ${data.statut_actuel || 'Non renseigné'}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-primary" onclick="loadPasteurForEdit(${pasteurId})" data-bs-dismiss="modal">
                                    <i class="fas fa-edit me-1"></i> Modifier
                                </button>
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                    <i class="fas fa-times me-1"></i> Fermer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Ajouter le modal au corps de la page
            document.body.insertAdjacentHTML('beforeend', modalContent);
            
            // Afficher le modal
            const modal = new bootstrap.Modal(document.getElementById('pasteurDetailsModal'));
            modal.show();
            
            // Supprimer le modal du DOM lorsqu'il est fermé
            document.getElementById('pasteurDetailsModal').addEventListener('hidden.bs.modal', function() {
                this.remove();
            });
        })
        .catch(error => {
            console.error('Erreur:', error);
            if (error.message.includes('404') || error.message.includes('No PersonnelPastoral matches')) {
                alert('Ce pasteur n\'existe plus dans la base de données. La liste va être actualisée.');
                // Recharger la page pour actualiser la liste
                window.location.reload();
            } else {
                alert('Erreur lors de la récupération des données du pasteur: ' + error.message);
            }
        });
}

// Fonction corrigée pour charger les données d'un pasteur pour modification
function loadPasteurForEdit(pasteurId) {
    console.log('Chargement des données du pasteur ID:', pasteurId);
    
    // Utiliser l'URL complète pour éviter les problèmes de chemin relatif
    const url = window.location.origin + `/get_pasteur_details/${pasteurId}/`;
    console.log('URL de requête:', url);
    
    fetch(url)
        .then(response => {
            console.log('Réponse reçue:', response.status);
            if (!response.ok) {
                throw new Error(`Erreur réseau lors de la récupération des données: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Données reçues:', data);
            
            // Fermer le modal de détails s'il est ouvert
            const detailsModal = document.getElementById('pasteurDetailsModal');
            if (detailsModal) {
                const bsModal = bootstrap.Modal.getInstance(detailsModal);
                if (bsModal) bsModal.hide();
            }
            
            // Fonction sécurisée pour définir la valeur d'un champ
            function setFieldValue(fieldId, value) {
                const field = document.getElementById(fieldId);
                if (field) {
                    field.value = value || '';
                } else {
                    console.warn(`Champ non trouvé: ${fieldId}`);
                }
            }
            
            // Ajouter un champ caché pour l'ID du pasteur s'il n'existe pas
            let pasteurIdField = document.getElementById('pasteur_id');
            if (!pasteurIdField) {
                pasteurIdField = document.createElement('input');
                pasteurIdField.type = 'hidden';
                pasteurIdField.id = 'pasteur_id';
                pasteurIdField.name = 'pasteur_id';
                document.querySelector('form').appendChild(pasteurIdField);
            }
            pasteurIdField.value = pasteurId;
            
            // Définir les correspondances entre les données API et les champs du formulaire
            const fieldMappings = [
                { apiField: 'nom', formField: 'nom' },
                { apiField: 'prenom', formField: 'prenoms' },
                { apiField: 'fonction', formField: 'fonction' },
                { apiField: 'sexe', formField: 'sexe' },
                { apiField: 'date_naissance', formField: 'date_naissance', isDate: true },
                { apiField: 'lieu_naissance', formField: 'lieu_naissance' },
                { apiField: 'nationalite', formField: 'nationalite' },
                { apiField: 'domicile', formField: 'domicile' },
                { apiField: 'etat_civil', formField: 'etat_civil' },
                { apiField: 'nombre_enfants', formField: 'nombre_enfants' },
                { apiField: 'profession', formField: 'profession' },
                { apiField: 'telephone', formField: 'telephone' },
                { apiField: 'email', formField: 'email' },
                { apiField: 'date_consecration', formField: 'date_consecration', isDate: true },
                { apiField: 'lieu_consecration', formField: 'lieu_consecration' },
                { apiField: 'consacre_par', formField: 'consacre_par' },
                { apiField: 'prenoms_pere', formField: 'prenoms_pere' },
                { apiField: 'prenoms_nom_mere', formField: 'prenoms_nom_mere' },
                { apiField: 'lieu_affectation', formField: 'lieu_affectation' },
                { apiField: 'date_affectation', formField: 'date_affectation', isDate: true },
                { apiField: 'region', formField: 'region' },
                { apiField: 'zone', formField: 'zone' },
                { apiField: 'types_formations', formField: 'types_formations' },
                { apiField: 'statut_actuel', formField: 'statut_actuel' }
            ];
            
            // Remplir le formulaire avec les données du pasteur en utilisant la fonction sécurisée
            console.log('Remplissage du formulaire avec les données suivantes:', data);
            
            // Parcourir les mappings et définir les valeurs des champs
            fieldMappings.forEach(mapping => {
                const value = data[mapping.apiField];
                if (value !== undefined && value !== null) {
                    if (mapping.isDate && value) {
                        setFieldValue(mapping.formField, value);
                    } else {
                        setFieldValue(mapping.formField, value);
                    }
                }
            });
            
            // Traitement spécial pour le champ église
            if (data.eglise_id) {
                // Vérifier tous les noms possibles pour le champ église
                const possibleEgliseFields = ['eglise_affectee', 'eglise', 'eglise_id'];
                let egliseField = null;
                
                for (const fieldName of possibleEgliseFields) {
                    const field = document.getElementById(fieldName);
                    if (field) {
                        egliseField = field;
                        console.log(`Champ église trouvé avec l'ID: ${fieldName}`);
                        break;
                    }
                }
                
                if (egliseField) {
                    egliseField.value = data.eglise_id;
                    console.log(`Église définie sur: ${data.eglise_id}`);
                } else {
                    console.warn('Aucun champ église trouvé dans le formulaire');
                }
            }
            
            // Afficher la photo si elle existe
            const photoPreview = document.getElementById('photoPreview');
            const previewImage = document.getElementById('previewImage');
            
            if (photoPreview && previewImage && data.photo) {
                previewImage.src = data.photo;
                photoPreview.style.display = 'block';
            } else if (photoPreview) {
                photoPreview.style.display = 'none';
            }
            
            // Changer le titre du formulaire et afficher le bouton de mise à jour
            const formTitle = document.getElementById('formTitle');
            if (formTitle) {
                formTitle.textContent = 'Modifier un Pasteur';
            }
            
            const submitBtn = document.getElementById('submitBtn');
            if (submitBtn) {
                submitBtn.textContent = 'Mettre à jour';
            }
            
            const resetBtn = document.getElementById('resetBtn');
            if (resetBtn) {
                resetBtn.style.display = 'inline-block';
            }
            
            // Faire défiler jusqu'au formulaire
            const pasteurForm = document.querySelector('form') || document.getElementById('personnelForm');
            if (pasteurForm) {
                pasteurForm.scrollIntoView({ behavior: 'smooth' });
            }
            
            // Afficher un message de succès
            const successMessage = document.createElement('div');
            successMessage.className = 'alert alert-success mt-3';
            successMessage.innerHTML = `<i class="fas fa-check-circle me-2"></i> Données du pasteur chargées avec succès pour modification`;
            
            const formContainer = pasteurForm ? pasteurForm.parentNode : document.querySelector('.card-body');
            if (formContainer) {
                formContainer.insertBefore(successMessage, formContainer.firstChild);
                setTimeout(() => successMessage.remove(), 5000);
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            if (error.message.includes('404') || error.message.includes('No PersonnelPastoral matches')) {
                alert('Ce pasteur n\'existe plus dans la base de données. La liste va être actualisée.');
                // Recharger la page pour actualiser la liste
                window.location.reload();
            } else {
                alert('Impossible de récupérer les données du pasteur pour modification: ' + error.message);
            }
        });
}
