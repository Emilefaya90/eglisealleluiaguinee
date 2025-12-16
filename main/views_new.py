from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.http import JsonResponse
from .models import Eglise, PersonnelPastoral
from datetime import datetime
import os

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
    # Récupérer toutes les églises pour le tableau
    eglises = Eglise.objects.all().order_by('-date_creation')
    
    # Dictionnaire pour stocker les données du formulaire en cas d'erreur
    form_data = {}
    
    if request.method == 'POST':
        # Gestion de la suppression d'église
        if request.POST.get('action') == 'supprimer':
            try:
                eglise_id = request.POST.get('eglise_id')
                eglise = Eglise.objects.get(id=eglise_id)
                nom_eglise = eglise.nom
                eglise.delete()
                messages.success(request, f"L'église '{nom_eglise}' a été supprimée avec succès.")
                return redirect('main:eglises')
            except Eglise.DoesNotExist:
                messages.error(request, "L'église demandée n'existe pas.")
                return redirect('main:eglises')
            except Exception as e:
                # Traduire l'erreur en français
                error_msg = str(e)
                if 'got unexpected keyword arguments' in error_msg:
                    error_msg = 'Arguments inattendus dans le formulaire. Veuillez vérifier les champs.'
                return render(request, 'main/eglises.html', {'error': error_msg, 'form_data': form_data})
        else:
            # Validation des champs obligatoires
            required_fields = ['nom', 'ville', 'pays', 'date_creation', 'responsable']
            missing_fields = []
            
            for field in required_fields:
                if not request.POST.get(field):
                    missing_fields.append(field)
            
            if missing_fields:
                error_msg = "Remplissez correctement les champs obligatoires."
                return render(request, 'main/eglises.html', {'error': error_msg, 'eglises': eglises})
            
            # Stocker toutes les données du formulaire
            form_data = {
                'nom': request.POST.get('nom', ''),
                'adresse': request.POST.get('adresse', ''),
                'ville': request.POST.get('ville', ''),
                'quartier': request.POST.get('quartier', ''),
                'pays': request.POST.get('pays', 'Guinée'),
                'date_creation': request.POST.get('date_creation', ''),
                'email': request.POST.get('email', ''),
                'telephone': request.POST.get('telephone', ''),
                'responsable': request.POST.get('responsable', ''),
                'nombre_membres': request.POST.get('nombre_membres', '0'),
                'est_association': request.POST.get('est_association', ''),
                'numero_autorisation': request.POST.get('numero_autorisation', ''),
                'date_enregistrement': request.POST.get('date_enregistrement', ''),
                'autres_activites_detail': request.POST.get('autres_activites_detail', ''),
                'nom_declarant': request.POST.get('nom_declarant', ''),
                'qualite_declarant': request.POST.get('qualite_declarant', ''),
                'date_declaration': request.POST.get('date_declaration', ''),
                'activites': request.POST.getlist('activites[]', [])
            }
            
            try:
                # Créer une nouvelle église
                nouvelle_eglise = Eglise(
                    nom=form_data['nom'],
                    adresse=form_data['adresse'],
                    ville=form_data['ville'],
                    quartier=form_data['quartier'],
                    pays=form_data['pays'],
                    date_creation=datetime.strptime(form_data['date_creation'], '%Y-%m-%d').date(),
                    email=form_data['email'],
                    telephone=form_data['telephone'],
                    responsable=form_data['responsable'],
                    nombre_membres=int(form_data['nombre_membres']) if form_data['nombre_membres'] else 0,
                    est_association=form_data['est_association'] == 'Oui',
                    numero_autorisation=form_data['numero_autorisation'],
                    date_enregistrement=datetime.strptime(form_data['date_enregistrement'], '%Y-%m-%d').date() if form_data['date_enregistrement'] else None,
                    autres_activites_detail=form_data['autres_activites_detail'],
                    nom_declarant=form_data['nom_declarant'],
                    qualite_declarant=form_data['qualite_declarant'],
                    date_declaration=datetime.strptime(form_data['date_declaration'], '%Y-%m-%d').date() if form_data['date_declaration'] else None
                )
                
                # Gérer l'image si elle est fournie
                if 'image' in request.FILES:
                    nouvelle_eglise.image = request.FILES['image']
                
                nouvelle_eglise.save()
                
                # Gérer les activités (relation many-to-many)
                if form_data['activites']:
                    nouvelle_eglise.activites.set(form_data['activites'])
                
                messages.success(request, f"L'église '{form_data['nom']}' a été enregistrée avec succès.")
                return redirect('main:eglises')
                
            except ValueError as e:
                if "time data" in str(e):
                    error_msg = "Format de date invalide. Utilisez le format AAAA-MM-JJ."
                else:
                    error_msg = f"Erreur de validation : {str(e)}"
                return render(request, 'main/eglises.html', {'error': error_msg, 'eglises': eglises, 'form_data': form_data})
            except Exception as e:
                error_msg = f"Erreur lors de l'enregistrement : {str(e)}"
                return render(request, 'main/eglises.html', {'error': error_msg, 'eglises': eglises, 'form_data': form_data})
    
    return render(request, 'main/eglises.html', {
        'eglises': eglises,
        'form_data': form_data
    })

def ajout_eglise(request):
    """Vue pour ajouter une nouvelle église"""
    return render(request, 'main/ajout_eglise.html')

def modifier_eglise(request, eglise_id):
    """Vue pour modifier une église existante"""
    eglise = get_object_or_404(Eglise, id=eglise_id)
    
    if request.method == 'POST':
        # Traitement de la modification
        pass
    
    return render(request, 'main/modifier_eglise.html', {'eglise': eglise})

def visite_pastorale(request):
    """Vue pour la gestion des visites pastorales"""
    return render(request, 'main/visite_pastorale.html')

def projet_local(request):
    """Vue pour la gestion des projets locaux"""
    return render(request, 'main/projet_local.html')

def personnel_pastoral(request):
    """Vue pour la gestion du personnel pastoral"""
    # Récupérer tous les pasteurs et églises pour affichage
    pasteurs = PersonnelPastoral.objects.all().order_by('-date_creation')
    eglises = Eglise.objects.all().order_by('nom')
    
    if request.method == 'POST':
        try:
            # Récupération des données du formulaire
            # Section 1: Informations personnelles
            nom = request.POST.get('nom', '').strip()
            prenoms = request.POST.get('prenoms', '').strip()
            fonction = request.POST.get('fonction', '').strip()
            sexe = request.POST.get('sexe', '').strip()
            date_naissance = request.POST.get('date_naissance')
            lieu_naissance = request.POST.get('lieu_naissance', '').strip()
            nationalite = request.POST.get('nationalite', '').strip()
            domicile = request.POST.get('domicile', '').strip()
            etat_civil = request.POST.get('etat_civil', '').strip()
            nombre_enfants = request.POST.get('nombre_enfants', '0')
            profession = request.POST.get('profession', '').strip()
            telephone = request.POST.get('telephone', '').strip()
            email = request.POST.get('email', '').strip()
            date_consecration = request.POST.get('date_consecration')
            lieu_consecration = request.POST.get('lieu_consecration', '').strip()
            consacre_par = request.POST.get('consacre_par', '').strip()
            
            # Section 2: Filiations
            prenoms_pere = request.POST.get('prenoms_pere', '').strip()
            prenoms_nom_mere = request.POST.get('prenoms_nom_mere', '').strip()
            
            # Section 3: Affectation
            eglise_id = request.POST.get('eglise_affectee')
            lieu_affectation = request.POST.get('lieu_affectation', '').strip()
            date_affectation = request.POST.get('date_affectation')
            region = request.POST.get('region', '').strip()
            zone = request.POST.get('zone', '').strip()
            
            # Section 4: Formations
            types_formations = request.POST.get('types_formations', '').strip()
            statut_actuel = request.POST.get('statut_actuel', '').strip()
            
            # Validation des champs obligatoires
            champs_obligatoires = {
                'nom': 'Nom',
                'prenoms': 'Prénoms',
                'fonction': 'Fonction',
                'sexe': 'Sexe',
                'eglise_id': 'Église d\'affectation'
            }
            
            champs_manquants = []
            champs_values = {
                'nom': nom,
                'prenoms': prenoms,
                'fonction': fonction,
                'sexe': sexe,
                'eglise_id': eglise_id
            }
            
            for champ, nom_champ in champs_obligatoires.items():
                if not champs_values[champ]:
                    champs_manquants.append(nom_champ)
            
            if champs_manquants:
                if len(champs_manquants) == 1:
                    messages.error(request, f"Veuillez remplir le champ obligatoire : {champs_manquants[0]}")
                else:
                    messages.error(request, f"Veuillez remplir les champs obligatoires suivants : {', '.join(champs_manquants)}")
                
                # Conserver les données saisies pour éviter de vider le formulaire
                form_data = {
                    'nom': nom,
                    'prenoms': prenoms,
                    'fonction': fonction,
                    'sexe': sexe,
                    'date_naissance': date_naissance,
                    'lieu_naissance': lieu_naissance,
                    'nationalite': nationalite,
                    'domicile': domicile,
                    'etat_civil': etat_civil,
                    'nombre_enfants': nombre_enfants,
                    'profession': profession,
                    'telephone': telephone,
                    'email': email,
                    'date_consecration': date_consecration,
                    'lieu_consecration': lieu_consecration,
                    'consacre_par': consacre_par,
                    'prenoms_pere': prenoms_pere,
                    'prenoms_nom_mere': prenoms_nom_mere,
                    'eglise_affectee': eglise_id,
                    'lieu_affectation': lieu_affectation,
                    'date_affectation': date_affectation,
                    'region': region,
                    'zone': zone,
                    'types_formations': types_formations,
                    'statut_actuel': statut_actuel,
                }
                
                return render(request, 'main/personnel_pastoral.html', {
                    'pasteurs': pasteurs,
                    'eglises': eglises,
                    'form_data': form_data,
                })
            
            # Vérifier que l'église existe
            try:
                eglise = Eglise.objects.get(id=int(eglise_id))
            except (ValueError, Eglise.DoesNotExist):
                messages.error(request, "L'église sélectionnée n'existe pas. Veuillez choisir une église valide dans la liste.")
                
                # Conserver les données saisies
                form_data = {
                    'nom': nom,
                    'prenoms': prenoms,
                    'fonction': fonction,
                    'sexe': sexe,
                    'date_naissance': date_naissance,
                    'lieu_naissance': lieu_naissance,
                    'nationalite': nationalite,
                    'domicile': domicile,
                    'etat_civil': etat_civil,
                    'nombre_enfants': nombre_enfants,
                    'profession': profession,
                    'telephone': telephone,
                    'email': email,
                    'date_consecration': date_consecration,
                    'lieu_consecration': lieu_consecration,
                    'consacre_par': consacre_par,
                    'prenoms_pere': prenoms_pere,
                    'prenoms_nom_mere': prenoms_nom_mere,
                    'eglise_affectee': eglise_id,
                    'lieu_affectation': lieu_affectation,
                    'date_affectation': date_affectation,
                    'region': region,
                    'zone': zone,
                    'types_formations': types_formations,
                    'statut_actuel': statut_actuel,
                }
                
                return render(request, 'main/personnel_pastoral.html', {
                    'pasteurs': pasteurs,
                    'eglises': eglises,
                    'form_data': form_data,
                })
            
            # Créer et enregistrer le personnel pastoral
            PersonnelPastoral.objects.create(
                nom=nom,
                prenom=prenoms,
                fonction=fonction,
                sexe=sexe,
                date_naissance=datetime.strptime(date_naissance, '%Y-%m-%d').date() if date_naissance else None,
                lieu_naissance=lieu_naissance,
                nationalite=nationalite,
                domicile=domicile,
                etat_civil=etat_civil,
                nombre_enfants=int(nombre_enfants) if nombre_enfants else 0,
                profession=profession,
                telephone=telephone,
                email=email,
                date_consecration=datetime.strptime(date_consecration, '%Y-%m-%d').date() if date_consecration else None,
                lieu_consecration=lieu_consecration,
                consacre_par=consacre_par,
                prenoms_pere=prenoms_pere,
                prenoms_nom_mere=prenoms_nom_mere,
                eglise=eglise,
                lieu_affectation=lieu_affectation,
                date_affectation=datetime.strptime(date_affectation, '%Y-%m-%d').date() if date_affectation else None,
                region=region,
                zone=zone,
                types_formations=types_formations,
                statut_actuel=statut_actuel,
                photo=request.FILES.get('photo'),
                document_fichier=request.FILES.get('document_fichier')
            )
            
            messages.success(request, f"Le pasteur {prenoms} {nom} a été enregistré avec succès dans le système.")
            
            # Redirection POST-Redirect-GET pour éviter la resoumission
            return redirect('personnel_pastoral')
            
        except ValueError as e:
            if "invalid literal for int()" in str(e):
                messages.error(request, "Erreur dans les données numériques. Vérifiez le nombre d'enfants et l'église sélectionnée.")
            elif "time data" in str(e):
                messages.error(request, "Format de date invalide. Utilisez le format JJ/MM/AAAA ou AAAA-MM-JJ.")
            else:
                messages.error(request, f"Erreur de validation des données : {str(e)}")
        except Eglise.DoesNotExist:
            messages.error(request, "L'église sélectionnée n'existe pas dans le système. Veuillez choisir une église valide.")
        except Exception as e:
            error_message = str(e)
            # Traduire les messages d'erreur courants en français
            if "Field 'id' expected a number but got" in error_message:
                messages.error(request, "Erreur : l'église sélectionnée n'est pas valide. Veuillez choisir une église dans la liste.")
            elif "UNIQUE constraint failed" in error_message:
                messages.error(request, "Ce pasteur existe déjà dans le système. Veuillez vérifier les informations saisies.")
            else:
                messages.error(request, f"Une erreur s'est produite lors de l'enregistrement : {error_message}")
    
    return render(request, 'main/personnel_pastoral.html', {
        'pasteurs': pasteurs,
        'eglises': eglises
    })

def get_pasteur_details(request, pasteur_id):
    """Vue pour récupérer les détails d'un pasteur en format JSON"""
    try:
        pasteur = get_object_or_404(PersonnelPastoral, id=pasteur_id)
        
        data = {
            'id': pasteur.id,
            'nom': pasteur.nom,
            'prenom': pasteur.prenom,
            'fonction': pasteur.fonction,
            'sexe': pasteur.sexe,
            'date_naissance': pasteur.date_naissance.strftime('%Y-%m-%d') if pasteur.date_naissance else '',
            'lieu_naissance': pasteur.lieu_naissance,
            'nationalite': pasteur.nationalite,
            'domicile': pasteur.domicile,
            'etat_civil': pasteur.etat_civil,
            'nombre_enfants': pasteur.nombre_enfants,
            'profession': pasteur.profession,
            'telephone': pasteur.telephone,
            'email': pasteur.email,
            'date_consecration': pasteur.date_consecration.strftime('%Y-%m-%d') if pasteur.date_consecration else '',
            'lieu_consecration': pasteur.lieu_consecration,
            'consacre_par': pasteur.consacre_par,
            'prenoms_pere': pasteur.prenoms_pere,
            'prenoms_nom_mere': pasteur.prenoms_nom_mere,
            'eglise_id': pasteur.eglise.id if pasteur.eglise else '',
            'eglise_nom': pasteur.eglise.nom if pasteur.eglise else '',
            'lieu_affectation': pasteur.lieu_affectation,
            'date_affectation': pasteur.date_affectation.strftime('%Y-%m-%d') if pasteur.date_affectation else '',
            'region': pasteur.region,
            'zone': pasteur.zone,
            'types_formations': pasteur.types_formations,
            'statut_actuel': pasteur.statut_actuel,
            'photo_url': pasteur.photo.url if pasteur.photo else '',
        }
        
        return JsonResponse(data)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def membres_eglise(request):
    """Vue pour la page Membres d'Eglise"""
    return render(request, 'main/membres_eglise.html')

def departements(request):
    """Vue pour la page Départements"""
    return render(request, 'main/departements.html')

def voir_departements(request):
    """Vue pour afficher les départements dans un formulaire séparé"""
    return render(request, 'main/voir_departements.html')

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

def get_eglise_by_name(request):
    """Vue pour récupérer les détails d'une église par son nom"""
    if request.method == 'GET':
        nom_eglise = request.GET.get('nom', '')
        
        if nom_eglise:
            try:
                eglise = Eglise.objects.get(nom__icontains=nom_eglise)
                data = {
                    'id': eglise.id,
                    'nom': eglise.nom,
                    'ville': eglise.ville,
                    'pays': eglise.pays,
                    'responsable': eglise.responsable,
                    'telephone': eglise.telephone,
                    'email': eglise.email,
                }
                return JsonResponse(data)
            except Eglise.DoesNotExist:
                return JsonResponse({'error': 'Église non trouvée'}, status=404)
            except Exception as e:
                return JsonResponse({'error': str(e)}, status=500)
        else:
            return JsonResponse({'error': 'Nom d\'église requis'}, status=400)
    
    return JsonResponse({'error': 'Méthode non autorisée'}, status=405)

def test_image(request):
    """Vue pour tester l'affichage d'une image"""
    return render(request, 'main/test_image.html')

def supprimer_eglise(request, eglise_id):
    """Vue pour supprimer une église"""
    if request.method == 'POST':
        try:
            eglise = get_object_or_404(Eglise, id=eglise_id)
            nom_eglise = eglise.nom
            eglise.delete()
            messages.success(request, f"L'église '{nom_eglise}' a été supprimée avec succès.")
        except Exception as e:
            messages.error(request, f"Erreur lors de la suppression : {str(e)}")
    
    return redirect('main:eglises')
