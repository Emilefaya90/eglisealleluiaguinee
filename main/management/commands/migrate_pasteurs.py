from django.core.management.base import BaseCommand
from main.models import PersonnelPastoral

class Command(BaseCommand):
    help = 'Migre les données des pasteurs de l\'ancien format vers le nouveau format'

    def handle(self, *args, **options):
        pasteurs = PersonnelPastoral.objects.all()
        count = 0
        
        for pasteur in pasteurs:
            # Vérifier si le pasteur utilise l'ancien format
            if not pasteur.fonction and hasattr(pasteur, 'poste'):
                pasteur.fonction = pasteur.poste
                count += 1
                
            if not pasteur.date_consecration and hasattr(pasteur, 'date_embauche'):
                pasteur.date_consecration = pasteur.date_embauche
                count += 1
                
            pasteur.save()
            
        self.stdout.write(self.style.SUCCESS(f'Migration réussie pour {count} champs de pasteurs'))
