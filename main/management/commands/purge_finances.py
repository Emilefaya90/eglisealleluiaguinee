from django.core.management.base import BaseCommand
from django.conf import settings
from django.utils import timezone
import shutil
from pathlib import Path

from main.models import Finance, FinanceReport, FinanceAttachment


class Command(BaseCommand):
    help = "Purge définitivement toutes les données financières (opérations, rapports, pièces jointes) avec sauvegarde préalable de la base."

    def add_arguments(self, parser):
        parser.add_argument(
            "--no-backup",
            action="store_true",
            help="Ne pas créer de sauvegarde du fichier de base de données avant la purge.",
        )
        parser.add_argument(
            "--confirm",
            action="store_true",
            help="Confirmer explicitement la suppression (sinon, l'opération s'arrête).",
        )

    def handle(self, *args, **options):
        if not options.get("confirm"):
            self.stdout.write(self.style.WARNING(
                "Sécurité: utilisez --confirm pour confirmer la suppression définitive. Aucune action effectuée."
            ))
            return

        # Sauvegarde de la base (SQLite) sauf --no-backup
        if not options.get("no_backup"):
            db_path = Path(settings.DATABASES["default"]["NAME"])  # type: ignore[index]
            if db_path.exists():
                stamp = timezone.now().strftime("%Y%m%d_%H%M%S")
                backup_path = db_path.with_name(f"{db_path.name}.backup_{stamp}")
                shutil.copy2(db_path, backup_path)
                self.stdout.write(self.style.SUCCESS(f"Backup créé: {backup_path}"))
            else:
                self.stdout.write(self.style.WARNING("Fichier base de données introuvable, saut de la sauvegarde."))
        else:
            self.stdout.write("Option --no-backup: aucune sauvegarde créée.")

        # Purge (ordre prudent)
        total_att = FinanceAttachment.objects.count()
        total_ops = Finance.objects.count()
        total_rep = FinanceReport.objects.count()

        # 1) Pièces jointes (au cas où des rapports subsistent sans cascade)
        deleted_att, _ = FinanceAttachment.objects.all().delete()
        # 2) Opérations orphelines (si certaines ne sont pas rattachées à un rapport)
        deleted_ops, _ = Finance.objects.all().delete()
        # 3) Rapports (CASCADE supprime aussi operations/attachments rattachés si encore présents)
        deleted_rep, _ = FinanceReport.objects.all().delete()

        self.stdout.write(self.style.SUCCESS(
            (
                "Purge terminée. Avant: {ta} pièces jointes, {to} opérations, {tr} rapports. "
                "Supprimé: att={da}, ops={do}, rep={dr}."
            ).format(ta=total_att, to=total_ops, tr=total_rep, da=deleted_att, do=deleted_ops, dr=deleted_rep)
        ))
