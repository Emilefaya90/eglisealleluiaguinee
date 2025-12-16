from django import forms
from .models import Membre

class DateInput(forms.DateInput):
    input_type = 'date'

class MembreForm(forms.ModelForm):
    class Meta:
        model = Membre
        fields = [
            'eglise', 'nom', 'prenom', 'sexe', 'date_naissance', 'lieu_naissance',
            'adresse', 'telephone', 'email', 'profession', 'date_bapteme',
            'lieu_bapteme', 'date_adhesion', 'etat_civil', 'nom_conjoint',
            'nombre_enfants', 'motivation', 'services', 'departement', 'soutien_financier',
            'montant_souhaite', 'piece_identite', 'certificat_bapteme',
        ]
        widgets = {
            'date_naissance': DateInput(),
            'date_bapteme': DateInput(),
            'date_adhesion': DateInput(),
            'motivation': forms.Textarea(attrs={'rows': 3}),
            'services': forms.Textarea(attrs={'rows': 2}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for name, field in self.fields.items():
            widget = field.widget
            # Classes par défaut selon le type de widget
            if isinstance(widget, (forms.TextInput, forms.EmailInput, forms.URLInput, forms.PasswordInput,
                                   forms.DateInput, forms.DateTimeInput, forms.TimeInput, forms.NumberInput,
                                   forms.ClearableFileInput)):
                widget.attrs.setdefault('class', 'form-control')
            elif isinstance(widget, (forms.Select, forms.SelectMultiple)):  # listes déroulantes
                widget.attrs.setdefault('class', 'form-select')
            elif isinstance(widget, forms.Textarea):
                # Conserver rows défini dans Meta et ajouter classe
                existing = widget.attrs.get('class', '')
                widget.attrs['class'] = (existing + ' form-control').strip()
            elif isinstance(widget, forms.CheckboxInput):
                # Pour le switch Bootstrap
                widget.attrs.setdefault('class', 'form-check-input')

    def clean(self):
        cleaned = super().clean()
        # Si pas de soutien financier, effacer le montant pour éviter incohérences
        if not cleaned.get('soutien_financier'):
            cleaned['montant_souhaite'] = None
        return cleaned
