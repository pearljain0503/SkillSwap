from django.db import models

# Create your models here.
from django.db import models

# 1. Member Table
class Member(models.Model):
    member_id = models.AutoField(primary_key=True)
    full_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    location = models.CharField(max_length=100)

    def __str__(self):
        return self.full_name


# 2. Skill Table
class Skill(models.Model):
    skill_id = models.AutoField(primary_key=True)
    member = models.ForeignKey(Member, on_delete=models.CASCADE)
    skill_name = models.CharField(max_length=100)
    description = models.TextField()
    category = models.CharField(max_length=50, default="education")
    rate = models.IntegerField(default=1)
    rating = models.FloatField(default=5.0)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    def __str__(self):
        return self.skill_name


# 3. Credit Wallet Table
class CreditWallet(models.Model):
    wallet_id = models.AutoField(primary_key=True)
    member = models.OneToOneField(Member, on_delete=models.CASCADE)
    credits = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.member.full_name} Wallet"


# 4. Service Session Table
class ServiceSession(models.Model):
    session_id = models.AutoField(primary_key=True)
    request = models.OneToOneField(
        'SkillRequest',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    seeker = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='seeker')
    provider = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='provider')
    hours = models.IntegerField()
    status = models.CharField(max_length=20)

    def __str__(self):
        skill_name = self.skill.skill_name if self.skill else "Skill"
        return (
            f"Session {self.session_id} - {skill_name} "
            f"({self.status})"
        )


# 5. Skill Request Table
class SkillRequest(models.Model):
    request_id = models.AutoField(primary_key=True)
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    requester = models.ForeignKey(
        Member, on_delete=models.CASCADE, related_name="requests_made"
    )
    provider = models.ForeignKey(
        Member, on_delete=models.CASCADE, related_name="requests_received"
    )
    status = models.CharField(max_length=20, default="pending")
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        skill_name = self.skill.skill_name if self.skill else "Skill"
        requester_name = self.requester.full_name if self.requester else "Requester"
        provider_name = self.provider.full_name if self.provider else "Provider"
        return (
            f"Request {self.request_id} - {skill_name} "
            f"({requester_name} → {provider_name}) [{self.status}]"
        )


# 6. Message Table (Chat)
class Message(models.Model):
    message_id = models.AutoField(primary_key=True)
    request = models.ForeignKey(
        SkillRequest, on_delete=models.CASCADE, related_name="messages"
    )
    sender = models.ForeignKey(Member, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        sender_name = self.sender.full_name if self.sender else "Sender"
        preview = (self.text or "").strip()[:30]
        return f"Message {self.message_id} - {sender_name}: {preview}"
