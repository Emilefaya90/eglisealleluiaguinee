// Gestion du modal d'édition AJAX pour le personnel pastoral

(function initActions() {
    if (window.__pp_actions_bound__) return; // garde anti-doublon
    window.__pp_actions_bound__ = true;
    function setup() {
        // Délégation pour les boutons d'action (robuste avec DataTables)
        document.addEventListener('click', function(e) {
            const target = e.target.closest('button');
            if (!target) return;
            const isActionBtn = target.classList.contains('edit-pasteur') || target.classList.contains('view-pasteur') || target.classList.contains('delete-pasteur') || target.classList.contains('details-pasteur');
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
                    target.classList.contains('delete-pasteur') ? 'delete' :
                    target.classList.contains('details-pasteur') ? 'details' : 'unknown',
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
            } else if (target.classList.contains('details-pasteur')) {
                if (pasteurId) openDetailsPasteurModal(pasteurId);
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

    // Créer/ouvrir le modal immédiatement (meilleure UX + debug si fetch KO)
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
              <button type="button" class="btn btn-primary" id="btnPrintPasteur" disabled>
                <i class="fas fa-print me-2"></i>Imprimer
              </button>
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
            </div>
          </div>
        </div>`;
        document.body.appendChild(modalEl);
    }

    const body = modalEl.querySelector('#viewPasteurBody');
    const printBtn = modalEl.querySelector('#btnPrintPasteur');
    if (printBtn) {
        printBtn.disabled = true;
        printBtn.onclick = null;
    }
    if (body) {
        body.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status"></div>
                <div class="mt-2 text-muted">Chargement des informations…</div>
            </div>
        `;
    }

    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    fetch(`/get_pasteur_details/${pasteurId}/`)
        .then(r => r.json())
        .then(result => {
            if (!result || result.success !== true || !result.data) {
                throw new Error((result && result.error) ? result.error : 'Impossible de charger les détails.');
            }
            const d = result.data;
            const safe = (v) => (v === null || v === undefined || v === '' ? '-' : v);
            const fullName = `${safe(d.nom)} ${safe(d.prenom)}`.replace(/\s+/g, ' ').trim();
            const roleLabel = safe(d.statut_actuel || d.fonction);
            const photo = d.photo_url
                ? `<img src="${d.photo_url}" alt="Photo" class="rounded-circle shadow-sm" style="width:96px;height:96px;object-fit:cover;">`
                : `<div class="bg-secondary bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center" style="width:96px;height:96px;">
                        <i class="fas fa-user text-secondary" style="font-size: 2rem;"></i>
                   </div>`;

            const egliseLogo = d.eglise_logo_url
                ? `<img src="${d.eglise_logo_url}" alt="Logo église" class="rounded shadow-sm" style="width:64px;height:64px;object-fit:cover;">`
                : '';

            const field = (label, value) => `
                <div class="col-md-6">
                    <div class="small text-muted">${label}</div>
                    <div class="fw-semibold">${safe(value)}</div>
                </div>
            `;

            body.innerHTML = `
                <div class="d-flex align-items-center gap-3 mb-3">
                    <div>${photo}</div>
                    <div class="flex-grow-1">
                        <div class="h5 mb-1">${escapeHtml(fullName)}</div>
                        <div class="d-flex flex-wrap gap-2 align-items-center">
                            <span class="badge bg-primary">${escapeHtml(roleLabel)}</span>
                            <span class="badge bg-light text-dark border">Église: ${escapeHtml(safe(d.eglise_nom))}</span>
                        </div>
                    </div>
                    ${egliseLogo ? `<div class="ms-auto">${egliseLogo}</div>` : ''}
                </div>

                <div class="card border-0 shadow-sm mb-3">
                    <div class="card-header bg-primary bg-opacity-10 border-0">
                        <div class="d-flex align-items-center gap-2">
                            <i class="fas fa-id-card text-primary"></i>
                            <strong>1. Identité & Contact</strong>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="row g-3">
                            ${field('Nom', d.nom)}
                            ${field('Prénoms', d.prenom)}
                            ${field('Sexe', d.sexe)}
                            ${field('Téléphone', d.telephone)}
                            ${field('Email', d.email)}
                            ${field('Profession', d.profession)}
                        </div>
                    </div>
                </div>

                <div class="card border-0 shadow-sm mb-3">
                    <div class="card-header bg-info bg-opacity-10 border-0">
                        <div class="d-flex align-items-center gap-2">
                            <i class="fas fa-user-circle text-info"></i>
                            <strong class="text-info">Informations Personnelles</strong>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="row g-3">
                            ${field('Date de naissance', d.date_naissance)}
                            ${field('Lieu de naissance', d.lieu_naissance)}
                            ${field('Nationalité', d.nationalite)}
                            ${field('Domicile', d.domicile)}
                            ${field('État civil', d.etat_civil)}
                            ${field("Nombre d'enfants", d.nombre_enfants)}
                        </div>
                    </div>
                </div>

                <div class="card border-0 shadow-sm mb-3">
                    <div class="card-header bg-success bg-opacity-10 border-0">
                        <div class="d-flex align-items-center gap-2">
                            <i class="fas fa-church text-success"></i>
                            <strong class="text-success">Affectation du Pasteur</strong>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="row g-3">
                            ${field('Fonction', d.fonction)}
                            ${field('Statut actuel du Pasteur', d.statut_actuel)}
                            ${field('Date de consécration', d.date_consecration)}
                            ${field('Lieu de consécration', d.lieu_consecration)}
                            ${field('Consacré par', d.consacre_par)}
                            ${field("Lieu d'affectation", d.lieu_affectation)}
                            ${field("Date d'affectation", d.date_affectation)}
                            ${field('Région', d.region)}
                            ${field('Zone', d.zone)}
                        </div>
                    </div>
                </div>

                <div class="card border-0 shadow-sm mb-3">
                    <div class="card-header bg-warning bg-opacity-10 border-0">
                        <div class="d-flex align-items-center gap-2">
                            <i class="fas fa-users text-warning"></i>
                            <strong class="text-warning">Filiation</strong>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="row g-3">
                            ${field('Prénoms du Père', d.prenoms_pere)}
                            ${field('Prénoms & Nom de la Mère', d.prenoms_nom_mere)}
                        </div>
                    </div>
                </div>

                <div class="card border-0 shadow-sm">
                    <div class="card-header bg-secondary bg-opacity-10 border-0">
                        <div class="d-flex align-items-center gap-2">
                            <i class="fas fa-graduation-cap text-secondary"></i>
                            <strong class="text-secondary">Formations Suivies du Pasteur</strong>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="row g-3">
                            <div class="col-12">
                                <div class="small text-muted">Types de formations</div>
                                <div class="fw-semibold">${escapeHtml(safe(d.types_formations))}</div>
                            </div>
                            ${d.diplomes_obtenus !== undefined ? `
                                <div class="col-12">
                                    <div class="small text-muted">Diplômes obtenus</div>
                                    <div class="fw-semibold">${escapeHtml(safe(d.diplomes_obtenus))}</div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>

                <div class="card border-0 shadow-sm mt-3">
                    <div class="card-header bg-primary bg-opacity-10 border-0">
                        <div class="d-flex align-items-center gap-2">
                            <i class="fas fa-file-download text-primary"></i>
                            <strong class="text-primary">Téléchargement de la Pièce d'Enregistrement</strong>
                        </div>
                    </div>
                    <div class="card-body">
                        ${d.document_url ? `
                            <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                <div class="text-muted small">
                                    ${escapeHtml(d.document_name || 'Pièce d\'enregistrement')}
                                </div>
                                <a href="${d.document_url}" target="_blank" class="btn btn-sm btn-outline-primary">
                                    <i class="fas fa-download me-1"></i> Télécharger
                                </a>
                            </div>
                        ` : `
                            <div class="text-muted">Aucune pièce jointe.</div>
                        `}
                    </div>
                </div>
            `;

            if (printBtn) {
                printBtn.disabled = false;
                printBtn.onclick = function() {
                    printPasteurDetails(modalEl);
                };
            }
        })
        .catch((err) => {
            console.error('[PP Actions] openViewPasteurModal fetch error', err);
            if (body) {
                body.innerHTML = `
                    <div class="alert alert-danger">
                        <div class="fw-semibold mb-1">Erreur lors du chargement des détails</div>
                        <div class="small">${escapeHtml(err && err.message ? err.message : 'Veuillez réessayer.')}</div>
                    </div>
                `;
            } else {
                alert('Erreur lors du chargement des détails.');
            }
        });
}

function printPasteurDetails(modalEl) {
    try {
        const body = modalEl.querySelector('#viewPasteurBody');
        if (!body) return;
        const w = window.open('', '_blank');
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8" />
                <title>Impression - Détails du pasteur</title>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">
                <style>
                    body { padding: 18px; }
                    .card { break-inside: avoid; page-break-inside: avoid; }
                    img { max-width: 100%; }
                    @media print {
                        .badge { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        .card-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    }
                </style>
            </head>
            <body>
                ${body.innerHTML}
                <script>
                    window.onload = function() {
                        window.print();
                        window.close();
                    };
                <\/script>
            </body>
            </html>
        `;
        w.document.open();
        w.document.write(html);
        w.document.close();
    } catch (e) {
        console.error('[PP Actions] printPasteurDetails error', e);
        alert('Impossible de lancer l\'impression.');
    }
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

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function openDetailsPasteurModal(pasteurId) {
    console.debug('[PP Actions] openDetailsPasteurModal', { pasteurId });

    // Créer le modal si non présent
    let modalEl = document.getElementById('detailsPasteurModal');
    if (!modalEl) {
        modalEl = document.createElement('div');
        modalEl.id = 'detailsPasteurModal';
        modalEl.className = 'modal fade';
        modalEl.tabIndex = -1;
        modalEl.innerHTML = `
        <div class="modal-dialog modal-xl modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header bg-success text-white">
              <h5 class="modal-title"><i class="fas fa-id-card me-2"></i>Détails du Pasteur</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div id="detailsPasteurBody"></div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" id="btnPrintDetailsPasteur" disabled>
                <i class="fas fa-print me-2"></i>Imprimer
              </button>
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
            </div>
          </div>
        </div>`;
        document.body.appendChild(modalEl);
    }

    const body = modalEl.querySelector('#detailsPasteurBody');
    const printBtn = modalEl.querySelector('#btnPrintDetailsPasteur');
    if (printBtn) {
        printBtn.disabled = true;
        printBtn.onclick = null;
    }
    if (body) {
        body.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-success" role="status"></div>
                <div class="mt-3 text-muted">Chargement des informations du pasteur...</div>
            </div>
        `;
    }

    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    fetch(`/get_pasteur_details/${pasteurId}/`)
        .then(r => r.json())
        .then(result => {
            if (!result || result.success !== true || !result.data) {
                throw new Error((result && result.error) ? result.error : 'Impossible de charger les détails.');
            }
            const d = result.data;
            const safe = (v) => (v === null || v === undefined || v === '' ? '-' : v);
            const fullName = `${safe(d.prenom)} ${safe(d.nom)}`.replace(/\s+/g, ' ').trim();

            const photo = d.photo_url
                ? `<img src="${d.photo_url}" alt="Photo" class="rounded-circle shadow" style="width:120px;height:120px;object-fit:cover;">`
                : `<div class="bg-secondary bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center" style="width:120px;height:120px;">
                        <i class="fas fa-user text-secondary" style="font-size: 3rem;"></i>
                   </div>`;

            const field = (label, value) => `
                <div class="col-md-6 col-lg-4 mb-3">
                    <div class="small text-muted">${label}</div>
                    <div class="fw-semibold">${escapeHtml(safe(value))}</div>
                </div>
            `;

            if (body) {
                body.innerHTML = `
                    <!-- En-tête avec photo et nom -->
                    <div class="text-center mb-4 pb-3 border-bottom">
                        <div class="mb-3">${photo}</div>
                        <h4 class="mb-1">${escapeHtml(fullName)}</h4>
                        <div class="d-flex flex-wrap justify-content-center gap-2">
                            <span class="badge bg-success fs-6">${escapeHtml(safe(d.fonction))}</span>
                            <span class="badge bg-primary fs-6">${escapeHtml(safe(d.statut_actuel))}</span>
                            <span class="badge bg-info text-dark">${escapeHtml(safe(d.eglise_nom))}</span>
                        </div>
                    </div>

                    <!-- Section 1: Informations Personnelles -->
                    <div class="card border-0 shadow-sm mb-4">
                        <div class="card-header py-3" style="background: linear-gradient(135deg, #4CAF50, #45a049);">
                            <h5 class="mb-0 text-white"><i class="fas fa-user me-2"></i>1. Informations Personnelles</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                ${field('Prénoms', d.prenom)}
                                ${field('Nom', d.nom)}
                                ${field('Sexe', d.sexe === 'M' ? 'Masculin' : d.sexe === 'F' ? 'Féminin' : d.sexe)}
                                ${field('Date de naissance', d.date_naissance)}
                                ${field('Lieu de naissance', d.lieu_naissance)}
                                ${field('Nationalité', d.nationalite)}
                                ${field('Domicile', d.domicile)}
                                ${field('État civil', d.etat_civil)}
                                ${field("Nombre d'enfants", d.nombre_enfants)}
                                ${field('Profession', d.profession)}
                                ${field('Téléphone', d.telephone)}
                                ${field('Email', d.email)}
                            </div>
                        </div>
                    </div>

                    <!-- Section 2: Filiation -->
                    <div class="card border-0 shadow-sm mb-4">
                        <div class="card-header py-3" style="background: linear-gradient(135deg, #FF9800, #F57C00);">
                            <h5 class="mb-0 text-white"><i class="fas fa-users me-2"></i>2. Filiation</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                ${field('Prénoms du Père', d.prenoms_pere)}
                                ${field('Prénoms & Nom de la Mère', d.prenoms_nom_mere)}
                            </div>
                        </div>
                    </div>

                    <!-- Section 3: Affectation du Pasteur -->
                    <div class="card border-0 shadow-sm mb-4">
                        <div class="card-header py-3" style="background: linear-gradient(135deg, #2196F3, #1976D2);">
                            <h5 class="mb-0 text-white"><i class="fas fa-church me-2"></i>3. Affectation du Pasteur</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                ${field('Fonction', d.fonction)}
                                ${field('Statut actuel', d.statut_actuel)}
                                ${field('Église affectée', d.eglise_nom)}
                                ${field("Lieu d'affectation", d.lieu_affectation)}
                                ${field("Date d'affectation", d.date_affectation)}
                                ${field('Région', d.region)}
                                ${field('Zone', d.zone)}
                                ${field('Date de consécration', d.date_consecration)}
                                ${field('Lieu de consécration', d.lieu_consecration)}
                                ${field('Consacré par', d.consacre_par)}
                            </div>
                        </div>
                    </div>

                    <!-- Section 4: Formations Suivies du Pasteur -->
                    <div class="card border-0 shadow-sm mb-4">
                        <div class="card-header py-3" style="background: linear-gradient(135deg, #9C27B0, #7B1FA2);">
                            <h5 class="mb-0 text-white"><i class="fas fa-graduation-cap me-2"></i>4. Formations Suivies du Pasteur</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-12 mb-3">
                                    <div class="small text-muted">Types de formations</div>
                                    <div class="fw-semibold" style="white-space: pre-wrap;">${escapeHtml(safe(d.types_formations))}</div>
                                </div>
                                ${d.diplomes_obtenus !== undefined ? `
                                    <div class="col-12">
                                        <div class="small text-muted">Diplômes obtenus</div>
                                        <div class="fw-semibold" style="white-space: pre-wrap;">${escapeHtml(safe(d.diplomes_obtenus))}</div>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>

                    <!-- Section 5: Téléchargement de la Pièce d'Enregistrement -->
                    <div class="card border-0 shadow-sm">
                        <div class="card-header py-3" style="background: linear-gradient(135deg, #607D8B, #455A64);">
                            <h5 class="mb-0 text-white"><i class="fas fa-file-download me-2"></i>5. Téléchargement de la Pièce d'Enregistrement</h5>
                        </div>
                        <div class="card-body">
                            ${d.document_url ? `
                                <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
                                    <div>
                                        <i class="fas fa-file-pdf text-danger me-2 fs-4"></i>
                                        <span class="text-muted">${escapeHtml(d.document_name || "Pièce d'enregistrement")}</span>
                                    </div>
                                    <a href="${d.document_url}" target="_blank" class="btn btn-outline-primary">
                                        <i class="fas fa-download me-2"></i>Télécharger le document
                                    </a>
                                </div>
                            ` : `
                                <div class="text-muted text-center py-3">
                                    <i class="fas fa-folder-open me-2"></i>Aucune pièce d'enregistrement disponible.
                                </div>
                            `}
                        </div>
                    </div>
                `;

                if (printBtn) {
                    printBtn.disabled = false;
                    printBtn.onclick = function() {
                        printDetailsPasteur(modalEl);
                    };
                }
            }
        })
        .catch((err) => {
            console.error('[PP Actions] openDetailsPasteurModal fetch error', err);
            if (body) {
                body.innerHTML = `
                    <div class="alert alert-danger">
                        <div class="fw-semibold mb-1"><i class="fas fa-exclamation-triangle me-2"></i>Erreur lors du chargement des détails</div>
                        <div class="small">${escapeHtml(err && err.message ? err.message : 'Veuillez réessayer.')}</div>
                    </div>
                `;
            }
        });
}

function printDetailsPasteur(modalEl) {
    try {
        const body = modalEl.querySelector('#detailsPasteurBody');
        if (!body) return;
        const w = window.open('', '_blank');
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8" />
                <title>Impression - Détails du Pasteur</title>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">
                <style>
                    body { padding: 20px; font-size: 12pt; }
                    .card { break-inside: avoid; page-break-inside: avoid; margin-bottom: 15px; }
                    .card-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .badge { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    img { max-width: 100px !important; height: auto !important; }
                    @media print {
                        .btn { display: none !important; }
                    }
                </style>
            </head>
            <body>
                <div class="text-center mb-4">
                    <h3>Fiche du Personnel Pastoral</h3>
                    <hr>
                </div>
                ${body.innerHTML}
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                            window.close();
                        }, 500);
                    };
                <\/script>
            </body>
            </html>
        `;
        w.document.open();
        w.document.write(html);
        w.document.close();
    } catch (e) {
        console.error('[PP Actions] printDetailsPasteur error', e);
        alert("Impossible de lancer l'impression.");
    }
}
