from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Member, Skill, CreditWallet, ServiceSession

admin.site.register(Member)
admin.site.register(Skill)
admin.site.register(CreditWallet)
admin.site.register(ServiceSession)
