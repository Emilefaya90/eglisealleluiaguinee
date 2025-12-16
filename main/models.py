from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator

class CulteEffectif(models.Model):
    """Historique des effectifs du culte du dimanche.
    Conserve les totaux par catégorie et la date de collecte.
    """
    eglise = models.ForeignKey('Eglise', on_delete=models.CASCADE, verbose_name=_('Église'))
    date = models.DateField(_('Date'), help_text=_("Date du culte"))
    hommes = models.PositiveIntegerField(_('Hommes'), default=0)
    femmes = models.PositiveIntegerField(_('Femmes'), default=0)
    filles = models.PositiveIntegerField(_('Enfants — Filles'), default=0)
    garcons = models.PositiveIntegerField(_('Enfants — Garçons'), default=0)
    nouveaux = models.PositiveIntegerField(_('Nouveaux'), default=0)
    total_enfants = models.PositiveIntegerField(_('Total enfants'), default=0)
    total = models.PositiveIntegerField(_('Effectif total'), default=0)
    created_at = models.DateTimeField(_('Créé le'), auto_now_add=True)

    class Meta:
        verbose_name = _('Effectif du culte')
        verbose_name_plural = _('Effectifs du culte')
        ordering = ['-date', '-id']
        unique_together = (('eglise', 'date'),)

    def __str__(self):
        return f"Effectif {self.date}: {self.total} (H:{self.hommes} F:{self.femmes} Enf:{self.total_enfants} Nv:{self.nouveaux})"

class Eglise(models.Model):
    # Informations de base
    nom = models.CharField(_('Nom'), max_length=100)
    adresse = models.CharField(_('Adresse'), max_length=200, blank=True, null=True)
    ville = models.CharField(_('Ville'), max_length=100)
    quartier = models.CharField(_('Quartier'), max_length=100, blank=True)
    pays = models.CharField(_('Pays'), max_length=100, default='Guinée')
    date_creation = models.DateField(_('Date de création'))
    email = models.EmailField(_('Email'), blank=True)
    telephone = models.CharField(_('Téléphone'), max_length=20, blank=True)
    responsable = models.CharField(_('Responsable'), max_length=100)
    nombre_membres = models.PositiveIntegerField(_('Nombre de membres'), default=0)
    
    # Statut juridique
    # db_column pour aligner avec l'ancienne colonne en base (association_enregistree)
    est_association = models.BooleanField(
        _('Est une association enregistrée'),
        default=False,
        db_column='association_enregistree'
    )
    numero_autorisation = models.CharField(_('Numéro d\'autorisation'), max_length=100, blank=True)
    date_enregistrement = models.DateField(_('Date d\'enregistrement'), null=True, blank=True)
    
    # Activités et services
    activites = models.TextField(_('Activités'), blank=True, help_text=_('Liste des activités séparées par des virgules'))
    autres_activites_detail = models.TextField(_('Détails des autres activités'), blank=True)
    
    # Pièces jointes (chemins des fichiers)
    membres_fondateurs_doc = models.FileField(_('Document des membres fondateurs'), upload_to='eglises/documents/', blank=True, null=True)
    statuts_doc = models.FileField(_('Document des statuts'), upload_to='eglises/documents/', blank=True, null=True)
    pieces_identite_doc = models.FileField(_('Pièces d\'identité'), upload_to='eglises/documents/', blank=True, null=True)
    preuve_adresse_doc = models.FileField(_('Preuve d\'adresse'), upload_to='eglises/documents/', blank=True, null=True)
    
    # Déclaration
    nom_declarant = models.CharField(_('Nom du déclarant'), max_length=100, blank=True)
    qualite_declarant = models.CharField(_('Qualité du déclarant'), max_length=100, blank=True)
    date_declaration = models.DateField(_('Date de déclaration'), null=True, blank=True)
    
    class Meta:
        verbose_name = _('Église')
        verbose_name_plural = _('Églises')
        ordering = ['nom']
    
    def __str__(self):
        return self.nom

class PersonnelPastoral(models.Model):
    SEXE_CHOICES = [
        ('M', _('Masculin')),
        ('F', _('Féminin')),
    ]
    
    ETAT_CIVIL_CHOICES = [
        ('celibataire', _('Célibataire')),
        ('marie', _('Marié(e)')),
        ('divorce', _('Divorcé(e)')),
        ('veuf', _('Veuf/Veuve')),
    ]
    
    STATUT_CHOICES = [
        ('pasteur_principal', _('Pasteur Principal')),
        ('pasteur_assistant', _('Pasteur Assistant')),
        ('pasteur_stagiaire', _('Pasteur Stagiaire')),
        ('evangeliste', _('Évangéliste')),
        ('diacre', _('Diacre')),
        ('ancien', _('Ancien')),
    ]
    
    # Informations personnelles
    nom = models.CharField(_('Nom'), max_length=100)
    prenom = models.CharField(_('Prénom'), max_length=100)
    fonction = models.CharField(_('Fonction'), max_length=100, blank=True, null=True)
    sexe = models.CharField(_('Sexe'), max_length=1, choices=SEXE_CHOICES)
    date_naissance = models.DateField(_('Date de naissance'))
    lieu_naissance = models.CharField(_('Lieu de naissance'), max_length=100, blank=True, null=True)
    nationalite = models.CharField(_('Nationalité'), max_length=100, blank=True, null=True)
    domicile = models.CharField(_('Domicile'), max_length=200, blank=True, null=True)
    etat_civil = models.CharField(_('État civil'), max_length=20, choices=ETAT_CIVIL_CHOICES, blank=True, null=True)
    nombre_enfants = models.PositiveIntegerField(_('Nombre d\'enfants'), default=0, blank=True, null=True)
    profession = models.CharField(_('Profession'), max_length=100, blank=True, null=True)
    telephone = models.CharField(_('Téléphone'), max_length=20, blank=True, null=True)
    email = models.EmailField(_('Email'), blank=True)
    date_consecration = models.DateField(_('Date de consécration'), blank=True, null=True)
    lieu_consecration = models.CharField(_('Lieu de consécration'), max_length=100, blank=True, null=True)
    consacre_par = models.CharField(_('Consacré par'), max_length=100, blank=True, null=True)
    photo = models.ImageField(_('Photo'), upload_to='personnel/photos/', blank=True, null=True)
    
    # Filiations
    prenoms_pere = models.CharField(_('Prénoms du Père'), max_length=100, blank=True, null=True)
    prenoms_nom_mere = models.CharField(_('Prénoms & Nom de la Mère'), max_length=100, blank=True, null=True)
    
    # Affectation
    eglise = models.ForeignKey(Eglise, on_delete=models.CASCADE, verbose_name=_('Église'))
    lieu_affectation = models.CharField(_('Lieu d\'affectation'), max_length=100, blank=True, null=True)
    date_affectation = models.DateField(_('Date d\'affectation'), blank=True, null=True)
    region = models.CharField(_('Région'), max_length=100, blank=True, null=True)
    zone = models.CharField(_('Zone'), max_length=100, blank=True, null=True)
    
    # Formations
    types_formations = models.TextField(_('Types de formations'), blank=True, null=True)
    statut_actuel = models.CharField(_('Statut actuel'), max_length=50, choices=STATUT_CHOICES, blank=True, null=True)
    
    # Document
    document_fichier = models.FileField(_('Document'), upload_to='personnel/documents/', blank=True, null=True)
    
    class Meta:
        verbose_name = _('Personnel Pastoral')
        verbose_name_plural = _('Personnel Pastoral')
        ordering = ['nom', 'prenom']
    
    def __str__(self):
        return f"{self.nom} {self.prenom} - {self.fonction or ''}"

class Membre(models.Model):
    SEXE_CHOICES = [
        ('M', _('Masculin')),
        ('F', _('Féminin')),
    ]
    
    ETAT_CIVIL_CHOICES = [
        ('celibataire', _('Célibataire')),
        ('marie', _('Marié(e)')),
        ('divorce', _('Divorcé(e)')),
        ('veuf', _('Veuf/Veuve')),
    ]
    
    eglise = models.ForeignKey(Eglise, on_delete=models.CASCADE, verbose_name=_('Église'))
    nom = models.CharField(_('Nom'), max_length=100)
    prenom = models.CharField(_('Prénom'), max_length=100)
    sexe = models.CharField(_('Sexe'), max_length=1, choices=SEXE_CHOICES)
    date_naissance = models.DateField(_('Date de naissance'))
    lieu_naissance = models.CharField(_('Lieu de naissance'), max_length=100)
    adresse = models.CharField(_('Adresse'), max_length=200)
    telephone = models.CharField(_('Téléphone'), max_length=20)
    email = models.EmailField(_('Email'), blank=True)
    profession = models.CharField(_('Profession'), max_length=100, blank=True)
    date_bapteme = models.DateField(_('Date de baptême'), null=True, blank=True)
    lieu_bapteme = models.CharField(_('Lieu de baptême'), max_length=100, blank=True)
    date_adhesion = models.DateField(_('Date d\'adhésion'))
    etat_civil = models.CharField(_('État civil'), max_length=20, choices=ETAT_CIVIL_CHOICES)
    nom_conjoint = models.CharField(_('Nom du conjoint'), max_length=100, blank=True)
    nombre_enfants = models.PositiveIntegerField(_('Nombre d\'enfants'), default=0)
    # Extensions
    motivation = models.TextField(_('Motivation'), blank=True)
    services = models.TextField(_('Services'), blank=True, help_text=_('Liste séparée par des virgules'))
    departement = models.TextField(_('Départements où vous souhaitez servir'), blank=True, help_text=_('Ex: Chorale, Évangélisation'))
    soutien_financier = models.BooleanField(_('Soutien financier'), default=False)
    montant_souhaite = models.DecimalField(_('Montant souhaité'), max_digits=12, decimal_places=2, null=True, blank=True)
    # Pièces jointes (optionnelles)
    piece_identite = models.FileField(_('Pièce d\'identité'), upload_to='personnel/documents/', null=True, blank=True)
    certificat_bapteme = models.FileField(_('Certificat de baptême'), upload_to='personnel/documents/', null=True, blank=True)
    
    class Meta:
        verbose_name = _('Membre')
        verbose_name_plural = _('Membres')
        ordering = ['nom', 'prenom']
    
    def __str__(self):
        return f"{self.prenom} {self.nom}"

class Departement(models.Model):
    eglise = models.ForeignKey(Eglise, on_delete=models.CASCADE, verbose_name=_('Église'))
    # Section 1: Informations générales
    nom = models.CharField(_('Nom du département'), max_length=150)
    responsable = models.CharField(_('Responsable'), max_length=150, blank=True, null=True)
    telephone = models.CharField(_('Téléphone'), max_length=30, blank=True, null=True)
    email = models.EmailField(_('Email'), blank=True, null=True)
    description = models.TextField(_('Description'), blank=True, null=True)
    date_creation = models.DateField(_('Date de création'), blank=True, null=True)
    statut_actif = models.BooleanField(_('Actif'), default=True)

    # Section 2: Objectifs et missions
    vision = models.TextField(_('Vision'), blank=True, null=True)
    mission = models.TextField(_('Mission'), blank=True, null=True)
    objectifs_specifiques = models.TextField(_('Objectifs spécifiques (liste)'), blank=True, null=True)

    # Section 3: Composition de l’équipe
    membres_clefs = models.TextField(_("Membres clés (CSV nom:fonction)"), blank=True, null=True)
    nombre_membres = models.PositiveIntegerField(_('Nombre de membres'), default=0, blank=True, null=True)

    # Section 4: Ressources et besoins
    ressources_disponibles = models.TextField(_('Ressources disponibles'), blank=True, null=True)
    besoins_prioritaires = models.TextField(_('Besoins prioritaires'), blank=True, null=True)
    budget_annuel_estime = models.DecimalField(_('Budget annuel estimé'), max_digits=12, decimal_places=2, blank=True, null=True)

    # Section 5: Calendrier des activités
    activites_majeures = models.TextField(_('Activités majeures (liste)'), blank=True, null=True)
    prochaine_activite_date = models.DateField(_('Prochaine activité - Date'), blank=True, null=True)
    prochaine_activite_lieu = models.CharField(_('Prochaine activité - Lieu'), max_length=150, blank=True, null=True)

    # Section 6: Validation par le Conseil Pastoral
    valide_par_conseil = models.BooleanField(_('Validé par le Conseil Pastoral'), default=False)
    date_validation = models.DateField(_('Date de validation'), blank=True, null=True)
    observations_conseil = models.TextField(_('Observations du Conseil'), blank=True, null=True)
    
    class Meta:
        verbose_name = _('Département')
        verbose_name_plural = _('Départements')
        ordering = ['nom']
    
    def __str__(self):
        return f"{self.nom} - {self.eglise.nom}"

class DepartementAttachment(models.Model):
    """Pièces jointes associées à un Département (section 6)."""
    departement = models.ForeignKey(Departement, on_delete=models.CASCADE, related_name='attachments', verbose_name=_('Département'))
    fichier = models.FileField(_('Fichier'), upload_to='departements/documents/')
    nom_original = models.CharField(_('Nom original'), max_length=255, blank=True)
    created_at = models.DateTimeField(_('Ajouté le'), auto_now_add=True)

    class Meta:
        verbose_name = _('Pièce jointe de Département')
        verbose_name_plural = _('Pièces jointes de Département')
        ordering = ['-created_at']

    def __str__(self):
        base = self.nom_original or (self.fichier.name if self.fichier else 'fichier')
        return f"{base} ({self.departement.nom})"

class Finance(models.Model):
    TYPE_DEPENSE = 'depense'
    TYPE_RECETTE = 'recette'
    
    TYPE_CHOICES = [
        (TYPE_DEPENSE, _('Dépense')),
        (TYPE_RECETTE, _('Recette')),
    ]
    
    # Rapport parent (nouveau): rempli lors de la soumission globale
    report = models.ForeignKey('FinanceReport', on_delete=models.CASCADE, verbose_name=_('Rapport financier'), null=True, blank=True, related_name='operations')
    eglise = models.ForeignKey(Eglise, on_delete=models.CASCADE, verbose_name=_('Église'))
    type_operation = models.CharField(_('Type d\'opération'), max_length=10, choices=TYPE_CHOICES)
    montant = models.DecimalField(_('Montant'), max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    date_operation = models.DateField(_('Date de l\'opération'))
    libelle = models.CharField(_('Libellé'), max_length=200)
    description = models.TextField(_('Description'), blank=True)
    beneficiaire = models.CharField(_('Bénéficiaire'), max_length=100, blank=True)
    categorie = models.CharField(_('Catégorie'), max_length=100)
    # Champs additionnels pour couvrir le formulaire
    source_revenu = models.CharField(_('Source de revenu'), max_length=150, blank=True)
    nature_depense = models.CharField(_('Nature dépense'), max_length=150, blank=True)
    mode_paiement = models.CharField(_('Mode de paiement'), max_length=50, blank=True)
    remarques = models.TextField(_('Remarques'), blank=True)
    justificatif_numero = models.CharField(_('Justificatif (N°)'), max_length=100, blank=True)
    
    class Meta:
        verbose_name = _('Opération Financière')
        verbose_name_plural = _('Opérations Financières')
        ordering = ['-date_operation']
    
    def __str__(self):
        return f"{self.get_type_operation_display()} - {self.libelle} - {self.montant} GNF"


class ComptabiliteReport(models.Model):
    eglise_nom = models.CharField(max_length=200)
    periode = models.CharField(max_length=100)
    responsable = models.CharField(max_length=100)
    contact = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    solde_initial = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_revenus = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_depenses = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    solde_final = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    sources_revenus = models.TextField(blank=True)
    dates_revenus = models.TextField(blank=True)
    modes_paiement_revenus = models.TextField(blank=True)
    evenements = models.TextField(blank=True)
    natures_depenses = models.TextField(blank=True)
    montants_depenses = models.TextField(blank=True)
    beneficiaires = models.TextField(blank=True)
    justificatifs = models.TextField(blank=True)
    categories = models.TextField(blank=True)
    nb_pj = models.IntegerField(default=0)
    verifie_par = models.CharField(max_length=100, blank=True)
    approuve_par = models.CharField(max_length=100, blank=True)
    date_rapport = models.CharField(max_length=20, blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Comptabilité {self.eglise_nom} - {self.periode}"
    
    class Meta:
        verbose_name = "Rapport Comptabilité"
        verbose_name_plural = "Rapports Comptabilité"

class FinanceReport(models.Model):
    """Regroupe un ensemble d'opérations financières pour une période."""
    eglise = models.ForeignKey(Eglise, on_delete=models.CASCADE, verbose_name=_('Église'))
    date_rapport = models.DateField(_('Date du rapport'), null=True, blank=True)
    periode_du = models.DateField(_('Du'), null=True, blank=True)
    periode_au = models.DateField(_('Au'), null=True, blank=True)
    responsable = models.CharField(_('Responsable'), max_length=150, blank=True)
    contact = models.CharField(_('Contact'), max_length=100, blank=True)
    email = models.EmailField(_('Email'), blank=True)
    total_recettes = models.DecimalField(_('Total recettes'), max_digits=12, decimal_places=2, null=True, blank=True)
    total_depenses = models.DecimalField(_('Total dépenses'), max_digits=12, decimal_places=2, null=True, blank=True)
    solde_initial = models.DecimalField(_('Solde initial'), max_digits=12, decimal_places=2, null=True, blank=True)
    solde_final = models.DecimalField(_('Solde final'), max_digits=12, decimal_places=2, null=True, blank=True)
    verifie_par = models.CharField(_('Vérifié par'), max_length=150, blank=True)
    date_verification = models.DateField(_('Date de vérification'), null=True, blank=True)
    approuve_par = models.CharField(_('Approuvé par'), max_length=150, blank=True)
    nombre_pieces_jointes = models.PositiveIntegerField(_('Nombre de pièces jointes'), null=True, blank=True)
    
    # Nouvelles colonnes pour le tableau historique
    source_revenu = models.TextField(_('Source de revenu'), blank=True, help_text=_('Sources de revenus séparées par des virgules'))
    mode_paiement = models.TextField(_('Mode de paiement'), blank=True, help_text=_('Modes de paiement séparés par des virgules'))
    evenement = models.TextField(_('Événement'), blank=True, help_text=_('Événements séparés par des virgules'))
    nature_depense = models.TextField(_('Nature dépense'), blank=True, help_text=_('Natures de dépenses séparées par des virgules'))
    beneficiaire = models.TextField(_('Bénéficiaire'), blank=True, help_text=_('Bénéficiaires séparés par des virgules'))
    justificatif = models.TextField(_('Justificatif'), blank=True, help_text=_('Justificatifs séparés par des virgules'))

    class Meta:
        verbose_name = _('Rapport Financier')
        verbose_name_plural = _('Rapports Financiers')
        ordering = ['-date_rapport', '-id']

    def __str__(self):
        p = f"{self.periode_du}→{self.periode_au}" if self.periode_du or self.periode_au else str(self.date_rapport or '')
        return f"Rapport {self.eglise.nom} ({p})"


class FinanceAttachment(models.Model):
    """Pièces justificatives rattachées à un rapport financier."""
    report = models.ForeignKey(FinanceReport, on_delete=models.CASCADE, related_name='attachments', verbose_name=_('Rapport'))
    nom = models.CharField(_('Nom'), max_length=255, blank=True)
    montant = models.DecimalField(_('Montant'), max_digits=12, decimal_places=2, null=True, blank=True)
    fichier = models.FileField(_('Fichier'), upload_to='finances/pieces_jointes/', null=True, blank=True)
    created_at = models.DateTimeField(_('Ajouté le'), auto_now_add=True)

    class Meta:
        verbose_name = _('Pièce justificative financière')
        verbose_name_plural = _('Pièces justificatives financières')
        ordering = ['-created_at']

    def __str__(self):
        return self.nom or (self.fichier.name if self.fichier else f"Pièce #{self.id}")


class ActiviteHebdo(models.Model):
    """Activités hebdomadaires récurrentes (planification)."""
    JOUR_CHOICES = [
        ('Dimanche', 'Dimanche'), ('Lundi', 'Lundi'), ('Mardi', 'Mardi'),
        ('Mercredi', 'Mercredi'), ('Jeudi', 'Jeudi'), ('Vendredi', 'Vendredi'), ('Samedi', 'Samedi'),
    ]
    eglise = models.ForeignKey(Eglise, on_delete=models.CASCADE, verbose_name=_('Église'), null=True, blank=True)
    nom = models.CharField(_('Nom de l\'activité'), max_length=200)
    jour = models.CharField(_('Jour'), max_length=20, choices=JOUR_CHOICES)
    heure_debut = models.TimeField(_('Heure de début'))
    duree_minutes = models.PositiveIntegerField(_('Durée (minutes)'), default=0)
    heure_fin = models.TimeField(_('Heure de fin'), null=True, blank=True)
    lieu = models.CharField(_('Lieu'), max_length=200, blank=True)
    responsable = models.CharField(_('Responsable'), max_length=150, blank=True)
    description = models.TextField(_('Description'), blank=True)
    created_at = models.DateTimeField(_('Créé le'), auto_now_add=True)

    class Meta:
        verbose_name = _('Activité hebdomadaire')
        verbose_name_plural = _('Activités hebdomadaires')
        ordering = ['jour', 'heure_debut', 'nom']

    def __str__(self):
        return f"{self.jour} {self.heure_debut} — {self.nom}"


class StrategicPlan(models.Model):
    """Planification stratégique des événements majeurs (vue hebdomadaire).
    Stocke les enregistrements soumis via le formulaire avec tous les champs demandés.
    """
    TYPE_CHOICES = [
        ('Annuelle', 'Annuelle'),
        ('Semestrielle', 'Semestrielle'),
        ('Trimestrielle', 'Trimestrielle'),
        ('Mensuelle', 'Mensuelle'),
        ('Hebdomadaire', 'Hebdomadaire'),
    ]
    STATUT_CHOICES = [
        ('À venir', 'À venir'),
        ('Confirmé', 'Confirmé'),
        ('Passé', 'Passé'),
    ]

    JOUR_CHOICES = ActiviteHebdo.JOUR_CHOICES

    eglise = models.ForeignKey(Eglise, on_delete=models.CASCADE, verbose_name=_('Église'))
    departement = models.CharField(_('Département'), max_length=200, blank=True)
    type_planification = models.CharField(_('Type de planification'), max_length=20, choices=TYPE_CHOICES)
    activite = models.CharField(_('Activité/Événement'), max_length=255)
    jour = models.CharField(_('Jour'), max_length=20, choices=JOUR_CHOICES)
    date_prev = models.DateField(_('Date prévisionnelle'))
    heure = models.TimeField(_('Heure'))
    lieu = models.CharField(_('Lieu'), max_length=200, blank=True)
    besoins = models.TextField(_('Besoins logistiques'), blank=True)
    responsable = models.CharField(_('Responsable principal'), max_length=200, blank=True)
    objectif = models.TextField(_('Objectif'), blank=True)
    budget = models.DecimalField(_('Budget alloué'), max_digits=12, decimal_places=2, null=True, blank=True)
    statut = models.CharField(_('Statut'), max_length=20, choices=STATUT_CHOICES, default='À venir')
    nom_resp = models.CharField(_('Nom du responsable'), max_length=200)
    nom_pasteur = models.CharField(_('Nom du pasteur'), max_length=200)
    date_valid = models.DateField(_('Date de validation'))
    created_at = models.DateTimeField(_('Créé le'), auto_now_add=True)

    class Meta:
        verbose_name = _('Planification stratégique')
        verbose_name_plural = _('Planifications stratégiques')
        ordering = ['-date_prev', '-id']

    def __str__(self):
        return f"{self.activite} - {self.eglise.nom} ({self.date_prev})"
