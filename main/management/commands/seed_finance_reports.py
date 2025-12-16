from django.core.management.base import BaseCommand
from django.utils import timezone
from decimal import Decimal
from main.models import Eglise, FinanceReport

class Command(BaseCommand):
    help = "Peuple quelques rapports financiers d'exemple (Banque) pour tests UI"

    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=5, help='Nombre de rapports à créer')
        parser.add_argument('--clear', action='store_true', help='Supprimer les rapports existants avant de peupler')

    def handle(self, *args, **options):
        count = max(1, int(options.get('count') or 5))
        clear = bool(options.get('clear'))

        # Église de base: prendre la première existante sinon créer une par défaut
        eglise = Eglise.objects.order_by('id').first()
        if not eglise:
            eglise = Eglise.objects.create(
                nom='Alléluia Bellevue',
                adresse='Quartier Bellevue',
                ville='Conakry',
                quartier='Bellevue',
                pays='Guinée',
                date_creation=timezone.now().date(),
                email='contact@alleluia.gn',
                telephone='+224 620 00 00 00',
                responsable='Pasteur John Doe',
                nombre_membres=150,
            )

        if clear:
            deleted, _ = FinanceReport.objects.all().delete()
            self.stdout.write(self.style.WARNING(f"Rapports supprimés: {deleted}"))

        created = 0
        today = timezone.now().date()
        for i in range(count):
            periode_du = today.replace(day=1)
            periode_au = today

            total_recettes = Decimal('1500000') + Decimal(str(i * 10000))
            total_depenses = Decimal('650000') + Decimal(str(i * 5000))
            solde_initial = Decimal('250000')
            solde_final = solde_initial + total_recettes - total_depenses

            # Listes détaillées (CSV)
            sources_revenus = 'Dîmes, Offrandes, Dons, Vente de livres'
            dates_revenus = '2025-08-01, 2025-08-08, 2025-08-15, 2025-08-22'
            modes_paiement = 'Espèces, Mobile Money, Espèces, Virement'
            natures_depenses = 'Sonorisation, Électricité, Aide sociale'
            montants_depenses = '150000, 200000, 300000'
            beneficiaires = 'Fournisseur Sono, EDG, Membres vulnérables'
            justificatifs = 'FAC-001, FAC-002, REC-015'

            rapport = FinanceReport.objects.create(
                eglise=eglise,
                date_rapport=today,
                periode_du=periode_du,
                periode_au=periode_au,
                responsable='Comptable Principal',
                contact='+224 621 00 00 00',
                email='compta@alleluia.gn',
                total_recettes=total_recettes,
                total_depenses=total_depenses,
                solde_initial=solde_initial,
                solde_final=solde_final,
                verifie_par='Trésorier',
                approuve_par='Pasteur Principal',
                nombre_pieces_jointes=3,
                # Champs agrégés pour affichage simple
                source_revenu=sources_revenus,
                mode_paiement=modes_paiement,
                evenement='',
                nature_depense=natures_depenses,
                beneficiaire=beneficiaires,
                justificatif=justificatifs,
            )

            created += 1

        self.stdout.write(self.style.SUCCESS(f"Rapports créés: {created} (Église: {eglise.nom})"))
