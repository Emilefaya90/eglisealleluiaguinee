# Guide de Déploiement en Production

## Prérequis
- Python 3.11+
- pip

## Étapes de déploiement

### 1. Installer les dépendances
```bash
pip install -r requirements.txt
```

### 2. Configurer les variables d'environnement
Créez un fichier `.env` ou configurez ces variables sur votre plateforme d'hébergement :

```bash
DEBUG=False
SECRET_KEY=votre-cle-secrete-unique-et-longue
ALLOWED_HOSTS=votre-domaine.com,www.votre-domaine.com
```

### 3. Collecter les fichiers statiques
```bash
python manage.py collectstatic --noinput
```

### 4. Appliquer les migrations
```bash
python manage.py migrate
```

### 5. Lancer le serveur de production
```bash
gunicorn gestion_eglise.wsgi --bind 0.0.0.0:8000
```

## Déploiement sur différentes plateformes

### Railway
1. Connectez votre repo GitHub
2. Railway détectera automatiquement Django
3. Ajoutez les variables d'environnement dans le dashboard

### Render
1. Créez un nouveau Web Service
2. Connectez votre repo
3. Build Command: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
4. Start Command: `gunicorn gestion_eglise.wsgi`

### PythonAnywhere
1. Créez un compte gratuit sur pythonanywhere.com
2. Uploadez votre code ou clonez depuis GitHub
3. Configurez le WSGI file pour pointer vers `gestion_eglise.wsgi`
4. Configurez les fichiers statiques: URL `/static/` -> Path `/home/username/Gestion_Eglise/staticfiles`

### Heroku
1. Installez Heroku CLI
2. `heroku create nom-de-votre-app`
3. `git push heroku main`
4. `heroku run python manage.py migrate`

## Résolution des problèmes courants

### Les images ne s'affichent pas
1. Vérifiez que `collectstatic` a été exécuté
2. Vérifiez que WhiteNoise est bien dans MIDDLEWARE
3. Vérifiez les chemins des images dans les templates

### La barre de navigation ne s'affiche pas correctement
1. Vérifiez que Bootstrap CSS/JS se charge (CDN accessible)
2. Vérifiez la console du navigateur pour les erreurs
3. Assurez-vous que les fichiers CSS locaux sont servis

### Erreur 500
1. Vérifiez les logs du serveur
2. Assurez-vous que DEBUG=False et ALLOWED_HOSTS est configuré
3. Vérifiez que toutes les migrations sont appliquées

## Commandes utiles

```bash
# Vérifier la configuration
python manage.py check --deploy

# Créer un superutilisateur
python manage.py createsuperuser

# Voir les fichiers statiques
python manage.py findstatic main/css/styles.css
```
