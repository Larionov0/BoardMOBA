from django.contrib import admin
from .models import *


for model in [Lobby]:
    admin.site.register(model)
