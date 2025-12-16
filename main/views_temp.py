from django.shortcuts import render

def accueil(request):
    """Vue pour la page d'accueil"""
    return render(request, 'main/accueil.html')

def apropos(request):
    """Vue pour la page À propos"""
    return render(request, 'main/apropos.html')

def historique(request):
    return render(request, 'main/historique.html')

def objectif_general(request):
    return render(request, 'main/objectif_general.html')

def objectif_specifique(request):
    return render(request, 'main/objectif_specifique.html')

def gestion(request):
    """Vue pour la page Gestion"""
    return render(request, 'main/gestion.html')

def eglises(request):
    """Vue pour la page Eglises"""
    from .models import Eglise
    from django.contrib import messages
    from django.shortcuts import redirect
    
    # Récupérer toutes les églises pour le tableau
    eglises = list(Eglise.objects.all().order_by('nom'))
    
    # Traiter le formulaire si c'est une requête POST
    if request.method == 'POST':
        try:
            # Gérer les activités (cases à cocher)
            activites_selectionnees = request.POST.getlist('activites[]')
            activites_str = ','.join(activites_selectionnees) if activites_selectionnees else ''
            
            # Gérer le statut d'association
            est_association = request.POST.get('association_enregistree') == 'oui'
            
            # Créer l'objet église avec tous les champs
            nouvelle_eglise = Eglise(
                # Informations de base
                nom=request.POST.get('nom'),
                adresse=request.POST.get('adresse'),
                ville=request.POST.get('ville'),
                quartier=request.POST.get('quartier') or '',
                pays=request.POST.get('pays') or 'Guinée',
                date_creation=request.POST.get('date_creation') or None,
                email=request.POST.get('email') or '',
                telephone=request.POST.get('telephone') or '',
                responsable=request.POST.get('responsable'),
                nombre_membres=int(request.POST.get('nombre_membres') or 0),
                
                # Statut juridique
                est_association=est_association,
                numero_enregistrement=request.POST.get('numero_enregistrement') or '',
                date_enregistrement=request.POST.get('date_enregistrement') if est_association else None,
                
                # Activités
                activites=activites_str,
                autres_activites_detail=request.POST.get('autres_activites_detail') or '',
                
                # Déclaration
                nom_declarant=request.POST.get('nom_declarant') or '',
                qualite_declarant=request.POST.get('qualite_declarant') or '',
                date_declaration=request.POST.get('date_declaration') or None
            )
            
            # Gérer les fichiers uploadés
            if request.FILES.get('membres_fondateurs_doc'):
                nouvelle_eglise.membres_fondateurs_doc = request.FILES['membres_fondateurs_doc']
            
            if request.FILES.get('statuts_doc'):
                nouvelle_eglise.statuts_doc = request.FILES['statuts_doc']
                
            if request.FILES.get('pieces_identite_doc'):
                nouvelle_eglise.pieces_identite_doc = request.FILES['pieces_identite_doc']
                
            if request.FILES.get('preuve_adresse_doc'):
                nouvelle_eglise.preuve_adresse_doc = request.FILES['preuve_adresse_doc']
            
            # Sauvegarder l'église
            nouvelle_eglise.save()
            
            messages.success(request, f"L'église {nouvelle_eglise.nom} a été ajoutée avec succès!")
            return redirect('main:eglises')  # Rediriger vers la même page pour voir la nouvelle église dans le tableau
        except Exception as e:
            error_msg = str(e)
            # Traduire les messages d'erreur courants
            if "NOT NULL constraint failed" in error_msg:
                # Extraire le nom du champ depuis le message d'erreur
                field_name = error_msg.split('.')[-1].strip()
                field_translations = {
                    'nom': 'nom de l\'église',
                    'adresse': 'adresse',
                    'ville': 'ville',
                    'date_creation': 'date de création',
                    'responsable': 'responsable',
                    'nombre_membres': 'nombre de membres'
                }
                translated_field = field_translations.get(field_name, field_name)
                messages.error(request, f"Erreur lors de l'enregistrement : Le champ '{translated_field}' est obligatoire.")
            else:
                messages.error(request, f"Erreur lors de l'enregistrement : {error_msg}")
    
    return render(request, 'main/eglises.html', {'eglises': eglises})

def ajout_eglise(request):
    """Vue pour l'ajout d'une nouvelle église"""
    from .models import Eglise
    from django.shortcuts import redirect
    from django.contrib import messages
    
    # Créer une église de test si aucune n'existe
    if Eglise.objects.count() == 0:
        try:
            from django.utils import timezone
            eglise_test = Eglise(
                nom="Église Test",
                adresse="123 Rue Test",
                ville="Conakry",
                pays="Guinée",
                date_creation=timezone.now().date(),
                responsable="Pasteur Test",
                nombre_membres=50
            )
            eglise_test.save()
            messages.info(request, "Une église test a été créée pour démonstration.")
        except Exception as e:
            messages.error(request, f"Erreur lors de la création de l'église test: {str(e)}")
    
    # Récupérer toutes les églises pour le tableau
    eglises = list(Eglise.objects.all().order_by('nom'))
    print(f"Nombre d'églises récupérées: {len(eglises)}")
    print(f"Liste des églises: {[e.nom for e in eglises]}")
    
    # Forcer l'existence d'une liste même vide pour le template
    if eglises is None:
        eglises = []
    
    # Traiter le formulaire si c'est une requête POST
    if request.method == 'POST':
        try:
            # Récupérer les données du formulaire
            nouvelle_eglise = Eglise(
                nom=request.POST.get('nom'),
                adresse=request.POST.get('adresse'),
                ville=request.POST.get('ville'),
                pays='Guinée',  # Valeur par défaut
                date_creation=request.POST.get('date_creation'),
                email=request.POST.get('email') or '',
                telephone=request.POST.get('telephone') or '',
                responsable=request.POST.get('responsable'),
                nombre_membres=int(request.POST.get('nombre_membres') or 0)
            )
            nouvelle_eglise.save()
            messages.success(request, f"L'église {nouvelle_eglise.nom} a été ajoutée avec succès!")
            return redirect('main:ajout_eglise')  # Rediriger vers la même page pour voir la nouvelle église dans le tableau
        except Exception as e:
            error_msg = str(e)
            # Traduire les messages d'erreur courants
            if "NOT NULL constraint failed" in error_msg:
                # Extraire le nom du champ depuis le message d'erreur
                field_name = error_msg.split('.')[-1].strip()
                field_translations = {
                    'nom': 'nom de l\'église',
                    'adresse': 'adresse',
                    'ville': 'ville',
                    'date_creation': 'date de création',
                    'responsable': 'responsable',
                    'nombre_membres': 'nombre de membres'
                }
                translated_field = field_translations.get(field_name, field_name)
                messages.error(request, f"Erreur lors de l'enregistrement : Le champ '{translated_field}' est obligatoire.")
            else:
                messages.error(request, f"Erreur lors de l'enregistrement : {error_msg}")
    
    return render(request, 'main/ajout_eglise.html', {'eglises': eglises})

def visite_pastorale(request):
    """Vue pour la gestion des visites pastorales"""
    return render(request, 'main/visite_pastorale.html')

def projet_local(request):
    """Vue pour la gestion des projets locaux"""
    return render(request, 'main/projet_local.html')

def personnel_pastoral(request):
    """Vue pour la page Personnel Pastoral"""
    return render(request, 'main/personnel_pastoral.html')

def membres_eglise(request):
    """Vue pour la page Membres d'Eglise"""
    return render(request, 'main/membres_eglise.html')

def departements(request):
    """Vue pour la page Départements"""
    return render(request, 'main/departements.html')

def finances(request):
    """Vue pour la page Finances"""
    return render(request, 'main/finances.html')

def actualite(request):
    """Vue pour la page Actualité"""
    return render(request, 'main/actualite.html')

def evenements(request):
    """Vue pour la page Événements"""
    return render(request, 'main/evenements.html')

def planification(request):
    """Vue pour la page Planification"""
    return render(request, 'main/planification.html')

def suivi_presences(request):
    """Vue pour la page Suivi des présences"""
    return render(request, 'main/suivi_presences.html')

def archivage_rapports(request):
    """Vue pour la page Archivage des rapports d'activités"""
    return render(request, 'main/archivage_rapports.html')

def communication(request):
    """Vue pour la page Communication"""
    return render(request, 'main/communication.html')

def contact(request):
    """Vue pour la page Nous contacter"""
    return render(request, 'main/contact.html')

def test_image(request):
    """Vue pour tester l'affichage d'une image"""
    return render(request, 'main/test_image.html')
