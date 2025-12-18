// Gestion du modal d'édition AJAX pour le personnel pastoral

(function initActions() {
    if (window.__pp_actions_bound__) return; // garde anti-doublon
    window.__pp_actions_bound__ = true;
    function setup() {
        // Délégation pour les boutons d'action (robuste avec DataTables)
        document.addEventListener('click', function(e) {
            const target = e.target.closest('button');
            if (!target) return;
            const isActionBtn = target.classList.contains('edit-pasteur') || target.classList.contains('view-pasteur') || target.classList.contains('delete-pasteur');
            if (!isActionBtn) return;
            // Empêcher toute action par défaut (ex.: focus/submit parasite)
            e.preventDefault();
            e.stopPropagation();

            // Récupérer l'ID depuis le bouton ou en fallback depuis la ligne
            let pasteurId = target.getAttribute('data-id');
            if (!pasteurId) {
                const tr = target.closest('tr[data-id]');
                if (tr) pasteurId = tr.getAttribute('data-id');
            }

            console.debug('[PP Actions] Click détecté', {
                type:
                    target.classList.contains('edit-pasteur') ? 'edit' :
                    target.classList.contains('view-pasteur') ? 'view' :
                    target.classList.contains('delete-pasteur') ? 'delete' : 'unknown',
                pasteurId
            });

            if (!pasteurId) {
                alert("Impossible d'identifier la ligne. ID manquant.");
                return;
            }

            if (target.classList.contains('edit-pasteur')) {
                if (pasteurId) openEditPasteurModal(pasteurId);
            } else if (target.classList.contains('view-pasteur')) {
                if (pasteurId) openViewPasteurModal(pasteurId);
            } else if (target.classList.contains('delete-pasteur')) {
                if (pasteurId) deletePasteur(pasteurId, target);
            }
        });

        // Gestion de la soumission du formulaire d'édition
        const editForm = document.getElementById('editPasteurForm');
        if (editForm) {
            editForm.addEventListener('submit', function(e) {
                e.preventDefault();
                submitEditPasteurForm();
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setup);
    } else {
        setup();
    }
})();

function openEditPasteurModal(pasteurId) {
    console.debug('[PP Actions] openEditPasteurModal', { pasteurId });
    fetch(`/get_pasteur_details/${pasteurId}/`)
        .then(response => response.json())
        .then(result => {
            if (!result.success || !result.data) {
                alert("Erreur lors du chargement des données du pasteur.");
                return;
            }
            const data = result.data;
            // Remplir tous les champs du formulaire d'édition
            document.getElementById('editPasteurId').value = data.id || '';
            document.getElementById('editPrenom').value = data.prenom || '';
            document.getElementById('editNom').value = data.nom || '';
            document.getElementById('editStatutActuel').value = data.statut_actuel || '';
            document.getElementById('editSexe').value = data.sexe || '';
            document.getElementById('editDateNaissance').value = data.date_naissance || '';
            document.getElementById('editLieuNaissance').value = data.lieu_naissance || '';
            document.getElementById('editNationalite').value = data.nationalite || '';
            document.getElementById('editDomicile').value = data.domicile || '';
            document.getElementById('editEtatCivil').value = data.etat_civil || '';
            document.getElementById('editNombreEnfants').value = data.nombre_enfants || 0;
            document.getElementById('editProfession').value = data.profession || '';
            document.getElementById('editTelephone').value = data.telephone || '';
            document.getElementById('editEmail').value = data.email || '';
            document.getElementById('editDateConsecration').value = data.date_consecration || '';
            document.getElementById('editLieuConsecration').value = data.lieu_consecration || '';
            document.getElementById('editConsacrePar').value = data.consacre_par || '';
            document.getElementById('editPrenomsPere').value = data.prenoms_pere || '';
            document.getElementById('editPrenomsNomMere').value = data.prenoms_nom_mere || '';
            // Église (select)
            const editEgliseSelect = document.getElementById('editEglise');
            if (editEgliseSelect) {
                editEgliseSelect.value = data.eglise_id || '';
            }
            document.getElementById('editLieuAffectation').value = data.lieu_affectation || '';
            document.getElementById('editDateAffectation').value = data.date_affectation || '';
            document.getElementById('editRegion').value = data.region || '';
            document.getElementById('editZone').value = data.zone || '';
            document.getElementById('editDiplomesObtenus').value = data.diplomes_obtenus || '';
            document.getElementById('editTypesFormations').value = data.types_formations || '';
            // Affichage de la photo si disponible
            const photoPrev = document.getElementById('editPhotoPreview');
            if (photoPrev) {
                if (data.photo_url) {
                    photoPrev.src = data.photo_url;
                    photoPrev.style.display = 'block';
                } else {
                    photoPrev.src = '';
                    photoPrev.style.display = 'none';
                }
            }
            // Prévisualisation lors du changement de fichier photo
            const photoInput = document.getElementById('editPhoto');
            if (photoInput) {
                photoInput.onchange = function(ev) {
                    const f = ev.target.files && ev.target.files[0];
                    if (!f) return;
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        if (photoPrev) {
                            photoPrev.src = e.target.result;
                            photoPrev.style.display = 'block';
                        }
                    };
                    reader.readAsDataURL(f);
                };
            }
            // Afficher le modal
            const modal = new bootstrap.Modal(document.getElementById('editPasteurModal'));
            modal.show();
        })
        .catch(error => {
            console.error('[PP Actions] openEditPasteurModal fetch error', error);
            alert("Erreur lors du chargement des données du pasteur.");
        });
}

function openViewPasteurModal(pasteurId) {
    console.debug('[PP Actions] openViewPasteurModal', { pasteurId });
    fetch(`/get_pasteur_details/${pasteurId}/`)
        .then(r => r.json())
        .then(result => {
            if (!result.success || !result.data) {
                alert('Impossible de charger les détails.');
                return;
            }
            const d = result.data;
            // Créer le modal si non présent
            let modalEl = document.getElementById('viewPasteurModal');
            if (!modalEl) {
                modalEl = document.createElement('div');
                modalEl.id = 'viewPasteurModal';
                modalEl.className = 'modal fade';
                modalEl.tabIndex = -1;
                modalEl.innerHTML = `
                <div class="modal-dialog modal-lg modal-dialog-scrollable">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title">Détails du pasteur</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                      <div id="viewPasteurBody"></div>
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                    </div>
                  </div>
                </div>`;
                document.body.appendChild(modalEl);
            }
            const body = modalEl.querySelector('#viewPasteurBody');
            const photo = d.photo_url ? `<img src="${d.photo_url}" class="rounded mb-3" style="width:100px;height:100px;object-fit:cover;">` : '';
            const safe = (v) => (v === null || v === undefined || v === '' ? '-' : v);
            body.innerHTML = `
                <div class="row g-3">
                  <div class="col-12">${photo}</div>
                  <div class="col-md-6"><strong>Prénoms:</strong> ${safe(d.prenom)}</div>
                  <div class="col-md-6"><strong>Nom:</strong> ${safe(d.nom)}</div>
                  <div class="col-md-6"><strong>Fonction / Statut actuel:</strong> ${safe(d.statut_actuel || d.fonction)}</div>
                  <div class="col-md-6"><strong>Sexe:</strong> ${safe(d.sexe)}</div>
                  <div class="col-md-6"><strong>Date de naissance:</strong> ${safe(d.date_naissance)}</div>
                  <div class="col-md-6"><strong>Lieu de naissance:</strong> ${safe(d.lieu_naissance)}</div>
                  <div class="col-md-6"><strong>Nationalité:</strong> ${safe(d.nationalite)}</div>
                  <div class="col-md-6"><strong>Domicile:</strong> ${safe(d.domicile)}</div>
                  <div class="col-md-6"><strong>État civil:</strong> ${safe(d.etat_civil)}</div>
                  <div class="col-md-6"><strong>Nombre d'enfants:</strong> ${safe(d.nombre_enfants)}</div>
                  <div class="col-md-6"><strong>Profession:</strong> ${safe(d.profession)}</div>
                  <div class="col-md-6"><strong>Téléphone:</strong> ${safe(d.telephone)}</div>
                  <div class="col-md-6"><strong>Email:</strong> ${safe(d.email)}</div>
                  <div class="col-md-6"><strong>Date de consécration:</strong> ${safe(d.date_consecration)}</div>
                  <div class="col-md-6"><strong>Lieu de consécration:</strong> ${safe(d.lieu_consecration)}</div>
                  <div class="col-md-6"><strong>Consacré par:</strong> ${safe(d.consacre_par)}</div>
                  <div class="col-md-6"><strong>Prénoms du Père:</strong> ${safe(d.prenoms_pere)}</div>
                  <div class="col-md-6"><strong>Prénoms & Nom de la Mère:</strong> ${safe(d.prenoms_nom_mere)}</div>
                  <div class="col-md-6"><strong>Église affectée:</strong> ${safe(d.eglise_nom)}</div>
                  <div class="col-md-6"><strong>Lieu d'affectation:</strong> ${safe(d.lieu_affectation)}</div>
                  <div class="col-md-6"><strong>Date d'affectation:</strong> ${safe(d.date_affectation)}</div>
                  <div class="col-md-6"><strong>Région:</strong> ${safe(d.region)}</div>
                  <div class="col-md-6"><strong>Zone:</strong> ${safe(d.zone)}</div>
                  <div class="col-md-12"><strong>Types de formations:</strong> ${safe(d.types_formations)}</div>
                  ${d.diplomes_obtenus !== undefined ? `<div class="col-md-12"><strong>Diplômes obtenus:</strong> ${safe(d.diplomes_obtenus)}</div>` : ''}
                </div>`;
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
        })
        .catch((err) => {
            console.error('[PP Actions] openViewPasteurModal fetch error', err);
            alert('Erreur lors du chargement des détails.');
        });
}


function submitEditPasteurForm() {
    const form = document.getElementById('editPasteurForm');
    const formData = new FormData(form);
    const pasteurId = formData.get('id');
    console.debug('[PP Actions] submitEditPasteurForm', { pasteurId });
    fetch(`/personnel-pastoral/modifier/${pasteurId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            const alertDiv = document.getElementById('editPasteurAlert');
            if (data.success) {
                alertDiv.className = 'alert alert-success';
                alertDiv.textContent = 'Modification enregistrée avec succès.';
                alertDiv.classList.remove('d-none');
                // Fermer le modal après un court délai
                setTimeout(() => {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('editPasteurModal'));
                    if (modal) modal.hide();
                    alertDiv.classList.add('d-none');
                    // Rafraîchir pour refléter tous les champs du tableau en toute sécurité
                    window.location.reload();
                }, 800);
            } else {
                alertDiv.className = 'alert alert-danger';
                alertDiv.textContent = data.error || 'Erreur lors de la modification.';
                alertDiv.classList.remove('d-none');
            }
        })
        .catch(error => {
            console.error('[PP Actions] submitEditPasteurForm error', error);
            const alertDiv = document.getElementById('editPasteurAlert');
            alertDiv.className = 'alert alert-danger';
            alertDiv.textContent = 'Erreur lors de la soumission.';
            alertDiv.classList.remove('d-none');
        });
}

function updatePasteurTableRow(pasteur) {
    // Sélectionner la ligne du tableau correspondant à l'ID
    const row = document.querySelector(`tr[data-id='${pasteur.id}']`);
    if (!row) return;
    // Par sécurité, on préfère recharger la page pour mettre à jour toutes les colonnes
    window.location.reload();
}

function deletePasteur(pasteurId, triggerEl) {
    console.debug('[PP Actions] deletePasteur', { pasteurId });
    if (!confirm('Confirmez-vous la suppression de ce pasteur ?')) return;
    fetch(`/personnel-pastoral/supprimer/${pasteurId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
        .then(r => r.json().catch(() => null))
        .then(data => {
            if (data && data.success) {
                // Supprimer la ligne sans recharger si possible
                const tr = triggerEl.closest('tr');
                if (tr) {
                    const table = $('#tablePersonnelPastoral').DataTable?.();
                    if (table) {
                        table.row(tr).remove().draw(false);
                    } else {
                        tr.remove();
                    }
                } else {
                    window.location.reload();
                }
            } else if (data && data.error) {
                alert(data.error);
            } else {
                // Si la vue a redirigé (pas JSON), recharger la page
                window.location.reload();
            }
        })
        .catch((err) => {
            console.error('[PP Actions] deletePasteur fetch error', err);
            window.location.reload();
        });
}

// Utilitaire pour le CSRF
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
