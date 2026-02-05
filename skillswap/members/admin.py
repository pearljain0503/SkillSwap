from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import (
    Member,
    Skill,
    CreditWallet,
    ServiceSession,
    SkillRequest,
    Message,
)


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ("member_id", "full_name", "email", "location")
    search_fields = ("full_name", "email", "location")


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ("skill_id", "skill_name", "member", "category", "rate")
    list_filter = ("category",)
    search_fields = ("skill_name", "member__full_name", "member__email")


@admin.register(CreditWallet)
class CreditWalletAdmin(admin.ModelAdmin):
    list_display = ("wallet_id", "member", "credits")


@admin.register(SkillRequest)
class SkillRequestAdmin(admin.ModelAdmin):
    list_display = (
        "request_id",
        "skill",
        "requester",
        "provider",
        "status",
        "created_at",
    )
    list_filter = ("status", "created_at")
    search_fields = ("skill__skill_name", "requester__full_name", "provider__full_name")


@admin.register(ServiceSession)
class ServiceSessionAdmin(admin.ModelAdmin):
    list_display = (
        "session_id",
        "request",
        "skill",
        "seeker",
        "provider",
        "hours",
        "status",
    )
    list_filter = ("status",)
    search_fields = ("skill__skill_name", "seeker__full_name", "provider__full_name")


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("message_id", "request", "sender", "short_text", "created_at")
    search_fields = ("text", "sender__full_name", "request__skill__skill_name")

    def short_text(self, obj):
        text = (obj.text or "").strip()
        return text[:40] + ("..." if len(text) > 40 else "")

    short_text.short_description = "Message"
