/**
 * Gestion du tableau des départements de l'église
 * Fonctionnalités: recherche, tri, actions (voir, modifier, supprimer)
 */

// Initialisation des fonctionnalités du tableau
function initializeTableFunctionalities() {
    console.log('Initialisation des fonctionnalités du tableau des départements');
    setupSearch();
    setupRefreshButton();
    setupActionButtons();
    setupScrollIndicator();
    updateDisplayCount();
    console.log('Initialisation terminée avec succès');
}

// Configuration de la recherche
function setupSearch() {
    const searchInput = document.getElementById('searchDepartementInput');
    if (!searchInput) return;

    // Délai de recherche pour éviter trop de requêtes pendant la frappe
    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(function() {
            filterTable(searchInput.value.trim().toLowerCase());
        }, 300); // Délai de 300ms
    });
}

// Filtrage du tableau en fonction du terme de recherche
function filterTable(searchTerm) {
    const table = document.getElementById('departementsTable');
    if (!table) return;
    
    const rows = table.querySelectorAll('tbody tr');
    let hasResults = false;
    
    rows.forEach(row => {
        let rowText = '';
        // Concaténer le texte de toutes les cellules sauf la dernière (actions)
        const cells = row.querySelectorAll('td:not(:last-child)');
        cells.forEach(cell => {
            rowText += cell.textContent.toLowerCase() + ' ';
        });
        
        if (rowText.includes(searchTerm)) {
            row.style.display = '';
            hasResults = true;
        } else {
            row.style.display = 'none';
        }
    });
    
    // Afficher un message si aucun résultat
    const tableBody = table.querySelector('tbody');
    let noResultRow = document.getElementById('noResultRow');
    
    if (!hasResults) {
        if (!noResultRow) {
            noResultRow = document.createElement('tr');
            noResultRow.id = 'noResultRow';
            const cell = document.createElement('td');
            cell.colSpan = table.querySelector('thead tr').children.length;
            cell.className = 'text-center py-3';
            cell.innerHTML = `<i class="fas fa-search me-2"></i>Aucun résultat trouvé pour <strong>"${searchTerm}"</strong>`;
            noResultRow.appendChild(cell);
            tableBody.appendChild(noResultRow);
        }
    } else if (noResultRow) {
        noResultRow.remove();
    }
    
    // Mettre à jour le compteur d'affichage
    updateDisplayCount();
}

// Configuration du bouton d'actualisation
function setupRefreshButton() {
    const refreshBtn = document.getElementById('refreshTableBtn');
    if (!refreshBtn) return;
    
    refreshBtn.addEventListener('click', function() {
        // Réinitialiser la recherche
        const searchInput = document.getElementById('searchDepartementInput');
        if (searchInput) searchInput.value = '';
        
        // Afficher toutes les lignes
        const rows = document.querySelectorAll('#departementsTable tbody tr');
        rows.forEach(row => {
            row.style.display = '';
        });
        
        // Supprimer le message "Aucun résultat"
        const noResultRow = document.getElementById('noResultRow');
        if (noResultRow) noResultRow.remove();
        
        // Mettre à jour le compteur
        updateDisplayCount();
        
        // Animation de rotation du bouton
        this.classList.add('rotate-animation');
        setTimeout(() => {
            this.classList.remove('rotate-animation');
        }, 1000);
        
        // Afficher un message de succès
        showSuccessMessage('Tableau actualisé avec succès !');
    });
}

// Configuration des boutons d'action
function setupActionButtons() {
    // Gestion des boutons "Voir détails"
    const viewButtons = document.querySelectorAll('.btn-info[title="Voir détails"]');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const departementId = this.getAttribute('data-departement-id');
            openViewModal(departementId);
        });
    });
    
    // Gestion des boutons "Modifier"
    const editButtons = document.querySelectorAll('.btn-warning[title="Modifier"]');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const departementId = this.getAttribute('data-departement-id');
            openEditModal(departementId);
        });
    });
    
    // Gestion des boutons "Supprimer"
    const deleteButtons = document.querySelectorAll('.btn-danger[title="Supprimer"]');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const departementId = this.getAttribute('data-departement-id');
            const row = this.closest('tr');
            const nomDepartement = row.cells[1].textContent.trim();
            openDeleteModal(departementId, nomDepartement);
        });
    });
    
    // Gestion du bouton de sauvegarde des modifications
    const saveModifierBtn = document.getElementById('saveModifierDepartementBtn');
    if (saveModifierBtn) {
        saveModifierBtn.addEventListener('click', function() {
            // Vérifier que les champs obligatoires sont remplis
            const form = document.getElementById('modifierDepartementForm');
            if (!form.checkValidity()) {
                // Ajouter un message d'erreur
                const errorAlert = document.createElement('div');
                errorAlert.className = 'alert alert-danger alert-dismissible fade show';
                errorAlert.innerHTML = `
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    <strong>Erreur :</strong> Veuillez remplir tous les champs obligatoires.
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                `;
                
                // Insérer le message au début du formulaire
                const modalBody = document.querySelector('#modifierDepartementModal .modal-body');
                modalBody.insertBefore(errorAlert, modalBody.firstChild);
                
                // Mettre en évidence les champs non remplis
                const invalidFields = form.querySelectorAll(':invalid');
                invalidFields.forEach(field => {
                    field.classList.add('is-invalid');
                    field.addEventListener('input', function() {
                        if (this.validity.valid) {
                            this.classList.remove('is-invalid');
                        }
                    });
                });
                
                form.reportValidity();
                return;
            }
            // Récupérer l'ID du département à modifier
            const departementId = document.getElementById('departementId').value;

            // Préparer les données à envoyer (mappage côté serveur)
            const payload = new FormData();
            payload.append('nom', document.getElementById('modifierNomDepartement').value);
            payload.append('responsable', document.getElementById('modifierResponsablePrincipal').value);
            payload.append('telephone', document.getElementById('modifierTelResponsable').value);
            payload.append('email', document.getElementById('modifierEmailResponsable').value);
            payload.append('description', document.getElementById('modifierDetails').value);
            payload.append('mission', document.getElementById('modifierMissionPrincipale').value);
            payload.append('activites_regulieres', document.getElementById('modifierActivitesRegulieres').value);
            payload.append('membres_comite', document.getElementById('modifierMembresComite').value);
            payload.append('budget', document.getElementById('modifierBudget').value);
            payload.append('materiel', document.getElementById('modifierMateriel').value);
            payload.append('besoins', document.getElementById('modifierBesoins').value);
            payload.append('autres_besoins', document.getElementById('modifierAutresBesoins').value);
            payload.append('frequence', document.getElementById('modifierFrequence').value);
            payload.append('evenements', document.getElementById('modifierEvenements').value);
            payload.append('approuve_par', document.getElementById('modifierApprouvePar').value);
            payload.append('date_validation', document.getElementById('modifierDateApprobation').value);

            // Utilitaires CSRF
            function getCookie(name) {
                const value = `; ${document.cookie}`;
                const parts = value.split(`; ${name}=`);
                if (parts.length === 2) return parts.pop().split(';').shift();
            }
            const csrftoken = getCookie('csrftoken');

            // Appel serveur
            fetch(`/departements/modifier/${departementId}/`, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': csrftoken || ''
                },
                body: payload
            })
            .then(async (res) => {
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.error || 'Erreur lors de la modification.');
                }
                return res.json();
            })
            .then((data) => {
                if (!data.success) throw new Error(data.error || 'Erreur inconnue.');
                const d = data.departement || {};
                // Mettre à jour la ligne du tableau avec les valeurs renvoyées par le serveur
                updateTableRow(departementId, {
                    nomDepartement: d.nom,
                    responsablePrincipal: d.responsable,
                    // Colonnes supplémentaires (si présentes dans le tableau)
                    telResponsable: d.telephone,
                    emailResponsable: d.email,
                    details: d.description,
                    missionPrincipale: d.mission,
                    membresComite: d.membres_comite,
                    budget: (d.budget || '').toString().replace(' GNF',''),
                    materiel: d.materiel,
                    besoins: d.besoins,
                    // Calendrier et approbation
                    frequence: d.frequence,
                    evenements: d.evenements,
                    approuvePar: d.approuve_par,
                    dateApprobation: d.date_validation
                });

                const modal = bootstrap.Modal.getInstance(document.getElementById('modifierDepartementModal'));
                modal.hide();
                showSuccessMessage('Département modifié avec succès !');
            })
            .catch((err) => {
                const errorAlert = document.createElement('div');
                errorAlert.className = 'alert alert-danger alert-dismissible fade show';
                errorAlert.innerHTML = `
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    <strong>Erreur :</strong> ${err.message || 'Impossible de modifier le département.'}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                `;
                const modalBody = document.querySelector('#modifierDepartementModal .modal-body');
                modalBody.insertBefore(errorAlert, modalBody.firstChild);
            });
        });
    }
    
    // Gestion du bouton de confirmation de suppression
    const confirmSupprimerBtn = document.getElementById('confirmSupprimerDepartementBtn');
    if (confirmSupprimerBtn) {
        confirmSupprimerBtn.addEventListener('click', function() {
            // Récupérer l'ID du département à supprimer
            const departementId = document.getElementById('supprimerDepartementId').value;
            
            // Dans une implémentation réelle, vous enverriez cette demande au serveur
            // Pour cette démonstration, nous allons simplement supprimer la ligne du tableau
            deleteTableRow(departementId);
            
            // Fermer la modale
            const modal = bootstrap.Modal.getInstance(document.getElementById('supprimerDepartementModal'));
            modal.hide();
            
            // Afficher un message de succès
            showSuccessMessage('Département supprimé avec succès !');
        });
    }
}

// Fonction pour ouvrir la modale de visualisation
function openViewModal(departementId) {
    // Récupérer les données du département à partir de son ID
    const row = document.querySelector(`[data-departement-id="${departementId}"]`).closest('tr');
    const cells = row.cells;
    
    // Remplir la modale avec les données
    document.getElementById('detailNomDepartement').textContent = cells[1].textContent.trim();
    document.getElementById('detailResponsablePrincipal').textContent = cells[2].textContent.trim();
    
    // Informations du responsable
    let responsableInfo = `
        <strong>État civil:</strong> ${cells[3].textContent.trim()}<br>
        <strong>Sexe:</strong> ${cells[4].textContent.trim()}<br>
        <strong>Domicile:</strong> ${cells[5].textContent.trim()}<br>
        <strong>Téléphone:</strong> ${cells[6].textContent.trim()}<br>
        <strong>Email:</strong> ${cells[7].textContent.trim()}
    `;
    document.getElementById('detailResponsableInfo').innerHTML = responsableInfo;
    
    // Informations de l'adjoint
    let adjointInfo = `
        <strong>Nom:</strong> ${cells[8].textContent.trim()}<br>
        <strong>Domicile:</strong> ${cells[9].textContent.trim()}<br>
        <strong>Téléphone:</strong> ${cells[10].textContent.trim()}
    `;
    document.getElementById('detailAdjointInfo').innerHTML = adjointInfo;
    
    // Mission et activités
    document.getElementById('detailMissionPrincipale').textContent = cells[11].textContent.trim();
    document.getElementById('detailActivitesRegulieres').textContent = cells[12].textContent.trim();
    document.getElementById('detailDescription').textContent = cells[13].textContent.trim();
    document.getElementById('detailMembresComite').textContent = cells[14].textContent.trim();
    
    // Ressources et besoins
    document.getElementById('detailBudget').textContent = cells[15].textContent.trim();
    document.getElementById('detailMateriel').textContent = cells[16].textContent.trim();
    document.getElementById('detailBesoins').textContent = cells[17].textContent.trim() + ', ' + cells[18].textContent.trim();
    
    // Calendrier
    document.getElementById('detailFrequence').textContent = cells[19].textContent.trim();
    document.getElementById('detailEvenements').textContent = cells[20].textContent.trim();
    
    // Approbation
    let approbation = `
        <strong>Approuvé par:</strong> ${cells[21].textContent.trim()}<br>
        <strong>Date:</strong> ${cells[22].textContent.trim()}
    `;
    document.getElementById('detailApprobation').innerHTML = approbation;
    
    // Ouvrir la modale
    const modal = new bootstrap.Modal(document.getElementById('voirDepartementModal'));
    modal.show();
}

// Fonction pour ouvrir la modale de modification
function openEditModal(departementId) {
    // Récupérer les données du département à partir de son ID
    const row = document.querySelector(`[data-departement-id="${departementId}"]`).closest('tr');
    const cells = row.cells;
    
    // Remplir le formulaire avec les données existantes
    document.getElementById('departementId').value = departementId;
    document.getElementById('modifierNomDepartement').value = cells[1].textContent.trim();
    
    // Responsable principal et ses informations
    document.getElementById('modifierResponsablePrincipal').value = cells[2].textContent.trim();
    document.getElementById('modifierEtatCivil').value = cells[3].textContent.trim();
    document.getElementById('modifierSexe').value = cells[4].textContent.trim();
    document.getElementById('modifierDomicileResponsable').value = cells[5].textContent.trim();
    document.getElementById('modifierTelResponsable').value = cells[6].textContent.trim();
    document.getElementById('modifierEmailResponsable').value = cells[7].textContent.trim();
    
    // Adjoint et ses informations
    document.getElementById('modifierAdjoint').value = cells[8].textContent.trim();
    document.getElementById('modifierDomicileAdjoint').value = cells[9].textContent.trim();
    document.getElementById('modifierTelAdjoint').value = cells[10].textContent.trim();
    
    // Mission et activités
    document.getElementById('modifierMissionPrincipale').value = cells[11].textContent.trim();
    document.getElementById('modifierActivitesRegulieres').value = cells[12].textContent.trim();
    document.getElementById('modifierDetails').value = cells[13].textContent.trim();
    document.getElementById('modifierMembresComite').value = cells[14].textContent.trim();
    
    // Budget et ressources
    const budgetText = cells[15].textContent.trim();
    document.getElementById('modifierBudget').value = budgetText.replace(/[^\d]/g, '');
    document.getElementById('modifierMateriel').value = cells[16].textContent.trim();
    document.getElementById('modifierBesoins').value = cells[17].textContent.trim();
    document.getElementById('modifierAutresBesoins').value = cells[18].textContent.trim();
    
    // Fréquence et événements
    document.getElementById('modifierFrequence').value = cells[19].textContent.trim();
    document.getElementById('modifierEvenements').value = cells[20].textContent.trim();
    
    // Approbation
    document.getElementById('modifierApprouvePar').value = cells[21].textContent.trim();
    
    // Convertir la date au format YYYY-MM-DD pour l'input date
    const dateApprobation = cells[22].textContent.trim();
    if (dateApprobation && dateApprobation !== '-') {
        const [jour, mois, annee] = dateApprobation.split('/');
        document.getElementById('modifierDateApprobation').value = `${annee}-${mois}-${jour}`;
    }
    
    // Ouvrir la modale
    const modal = new bootstrap.Modal(document.getElementById('modifierDepartementModal'));
    modal.show();
}

// Fonction pour ouvrir la modale de suppression
function openDeleteModal(departementId, nomDepartement) {
    document.getElementById('supprimerDepartementId').value = departementId;
    document.getElementById('supprimerDepartementNom').textContent = nomDepartement;
    
    const modal = new bootstrap.Modal(document.getElementById('supprimerDepartementModal'));
    modal.show();
}

// Fonction pour mettre à jour une ligne du tableau
function updateTableRow(departementId, data) {
    // Trouver la ligne correspondant à l'ID du département
    const button = document.querySelector(`button[data-departement-id="${departementId}"]`);
    if (!button) return;
    
    const row = button.closest('tr');
    if (!row) return;
    
    // Mettre à jour les cellules avec les nouvelles données
    if (data.nomDepartement) row.cells[1].textContent = data.nomDepartement;
    
    // Informations du responsable principal
    if (data.responsablePrincipal) row.cells[2].textContent = data.responsablePrincipal;
    if (data.etatCivil) row.cells[3].textContent = data.etatCivil;
    if (data.sexe) row.cells[4].textContent = data.sexe;
    if (data.domicileResponsable) row.cells[5].textContent = data.domicileResponsable;
    if (data.telResponsable) row.cells[6].textContent = data.telResponsable;
    if (data.emailResponsable) row.cells[7].textContent = data.emailResponsable;
    
    // Informations de l'adjoint
    if (data.adjoint) row.cells[8].textContent = data.adjoint;
    if (data.domicileAdjoint) row.cells[9].textContent = data.domicileAdjoint;
    if (data.telAdjoint) row.cells[10].textContent = data.telAdjoint;
    
    // Mission et activités
    if (data.missionPrincipale) row.cells[11].textContent = data.missionPrincipale;
    if (data.activitesRegulieres) row.cells[12].textContent = data.activitesRegulieres;
    if (data.details) row.cells[13].textContent = data.details;
    if (data.membresComite) row.cells[14].textContent = data.membresComite;
    
    // Budget et ressources
    if (data.budget) row.cells[15].textContent = `${data.budget} GNF`;
    if (data.materiel) row.cells[16].textContent = data.materiel;
    if (data.besoins) row.cells[17].textContent = data.besoins;
    if (data.autresBesoins) row.cells[18].textContent = data.autresBesoins;
    
    // Fréquence et événements
    if (data.frequence) row.cells[19].textContent = data.frequence;
    if (data.evenements) row.cells[20].textContent = data.evenements;
    
    // Approbation
    if (data.approuvePar) row.cells[21].textContent = data.approuvePar;
    if (data.dateApprobation) row.cells[22].textContent = data.dateApprobation;
}

// Fonction pour supprimer une ligne du tableau
function deleteTableRow(departementId) {
    // Trouver la ligne correspondant à l'ID du département
    const button = document.querySelector(`button[data-departement-id="${departementId}"]`);
    if (!button) return;
    
    const row = button.closest('tr');
    if (!row) return;
    
    // Supprimer la ligne du tableau avec une animation
    row.classList.add('fade-out');
    setTimeout(() => {
        row.remove();
        // Mettre à jour le compteur d'affichage
        updateDisplayCount();
    }, 500);
}

// Fonction pour mettre à jour le compteur d'affichage
function updateDisplayCount() {
    const visibleRows = document.querySelectorAll('#departementsTable tbody tr:not([style*="display: none"]):not(#noResultRow)');
    const countDisplay = document.querySelector('.text-muted');
    
    if (countDisplay) {
        countDisplay.innerHTML = `Affichage de <strong>1-${visibleRows.length}</strong> sur <strong>${visibleRows.length}</strong> départements`;
    }
}

// Configuration de l'indicateur de défilement horizontal
function setupScrollIndicator() {
    const tableContainer = document.querySelector('.table-responsive');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    
    if (!tableContainer || !scrollIndicator) return;
    
    // Vérifier si le défilement horizontal est nécessaire
    function checkScrollable() {
        if (tableContainer.scrollWidth > tableContainer.clientWidth) {
            scrollIndicator.style.display = 'block';
            
            // Masquer l'indicateur après 5 secondes si l'utilisateur a déjà fait défiler
            if (tableContainer.scrollLeft > 0) {
                setTimeout(() => {
                    scrollIndicator.style.opacity = '0';
                    setTimeout(() => {
                        scrollIndicator.style.display = 'none';
                    }, 500);
                }, 5000);
            }
        } else {
            scrollIndicator.style.display = 'none';
        }
    }
    
    // Masquer l'indicateur lors du défilement
    tableContainer.addEventListener('scroll', function() {
        if (this.scrollLeft > 50) {
            scrollIndicator.style.opacity = '0';
            setTimeout(() => {
                scrollIndicator.style.display = 'none';
            }, 500);
        } else {
            scrollIndicator.style.opacity = '1';
            scrollIndicator.style.display = 'block';
        }
    });
    
    // Vérifier au chargement et au redimensionnement
    window.addEventListener('resize', checkScrollable);
    checkScrollable();
    
    // Ajouter un événement de clic sur l'indicateur pour faire défiler vers la droite
    scrollIndicator.addEventListener('click', function() {
        tableContainer.scrollLeft += 200; // Défiler de 200px vers la droite
    });
}

// Fonction pour afficher un message de succès
function showSuccessMessage(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show m-3';
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `<i class="fas fa-check-circle me-2"></i> ${message} <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
    
    const cardBody = document.querySelector('#departementsTable').closest('.card-body') || document.querySelector('#departementsTable').closest('.content-section');
    cardBody.insertBefore(alertDiv, cardBody.firstChild);
    
    // Supprimer l'alerte après 3 secondes
    setTimeout(function() {
        alertDiv.remove();
    }, 3000);
}

// Fonction pour formater une date YYYY-MM-DD en JJ/MM/AAAA
function formatDateForDisplay(dateString) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

// Ajouter un style CSS pour l'animation de rotation
document.addEventListener('DOMContentLoaded', function() {
    console.log('Script departements_table.js chargé');
    
    const style = document.createElement('style');
    style.textContent = `
        .rotate-animation {
            animation: rotate 1s ease-in-out;
        }
        
        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    // Initialiser les fonctionnalités du tableau
    initializeTableFunctionalities();
    
    // Gestion du bouton "Voir les Départements"
    const voirDepartementsBtn = document.getElementById('voirDepartementsBtn');
    if (voirDepartementsBtn) {
        voirDepartementsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Rediriger vers la page voir_departements.html
            window.location.href = '/voir_departements/';
        });
    }
});
