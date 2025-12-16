from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator

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
    est_association = models.BooleanField(_('Est une association enregistrée'), default=False)
    numero_enregistrement = models.CharField(_('Numéro d\'enregistrement'), max_length=100, blank=True)
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
    
    eglise = models.ForeignKey(Eglise, on_delete=models.CASCADE, verbose_name=_('Église'))
    nom = models.CharField(_('Nom'), max_length=100)
    prenom = models.CharField(_('Prénom'), max_length=100)
    sexe = models.CharField(_('Sexe'), max_length=1, choices=SEXE_CHOICES)
    date_naissance = models.DateField(_('Date de naissance'))
    telephone = models.CharField(_('Téléphone'), max_length=20)
    email = models.EmailField(_('Email'), blank=True)
    poste = models.CharField(_('Poste'), max_length=100)
    date_embauche = models.DateField(_('Date d\'embauche'))
    
    class Meta:
        verbose_name = _('Personnel Pastoral')
        verbose_name_plural = _('Personnel Pastoral')
        ordering = ['nom', 'prenom']
    
    def __str__(self):
        return f"{self.prenom} {self.nom} - {self.poste}"

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
    
    class Meta:
        verbose_name = _('Membre')
        verbose_name_plural = _('Membres')
        ordering = ['nom', 'prenom']
    
    def __str__(self):
        return f"{self.prenom} {self.nom}"

class Departement(models.Model):
    eglise = models.ForeignKey(Eglise, on_delete=models.CASCADE, verbose_name=_('Église'))
    nom = models.CharField(_('Nom du département'), max_length=100)
    responsable = models.CharField(_('Responsable'), max_length=100)
    telephone = models.CharField(_('Téléphone'), max_length=20, blank=True)
    email = models.EmailField(_('Email'), blank=True)
    description = models.TextField(_('Description'), blank=True)
    
    class Meta:
        verbose_name = _('Département')
        verbose_name_plural = _('Départements')
        ordering = ['nom']
    
    def __str__(self):
        return f"{self.nom} - {self.eglise.nom}"

class Finance(models.Model):
    TYPE_DEPENSE = 'depense'
    TYPE_RECETTE = 'recette'
    
    TYPE_CHOICES = [
        (TYPE_DEPENSE, _('Dépense')),
        (TYPE_RECETTE, _('Recette')),
    ]
    
    eglise = models.ForeignKey(Eglise, on_delete=models.CASCADE, verbose_name=_('Église'))
    type_operation = models.CharField(_('Type d\'opération'), max_length=10, choices=TYPE_CHOICES)
    montant = models.DecimalField(_('Montant'), max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    date_operation = models.DateField(_('Date de l\'opération'))
    libelle = models.CharField(_('Libellé'), max_length=200)
    description = models.TextField(_('Description'), blank=True)
    beneficiaire = models.CharField(_('Bénéficiaire'), max_length=100, blank=True)
    categorie = models.CharField(_('Catégorie'), max_length=100)
    
    class Meta:
        verbose_name = _('Opération Financière')
        verbose_name_plural = _('Opérations Financières')
        ordering = ['-date_operation']
    
    def __str__(self):
        return f"{self.get_type_operation_display()} - {self.libelle} - {self.montant} GNF"
