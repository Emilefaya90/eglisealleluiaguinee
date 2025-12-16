from django import template

register = template.Library()

@register.filter
def split_diplomes(value):
    """
    Sépare une chaîne de diplômes par la virgule et enlève les espaces inutiles.
    Usage dans le template : {{ p.diplomes_obtenus|split_diplomes }}
    """
    if not value:
        return []
    return [diplome.strip() for diplome in value.split(',') if diplome.strip()]
