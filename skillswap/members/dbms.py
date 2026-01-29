from .models import Member, Skill, CreditWallet, ServiceSession


# 1. STORE DATA (Create Member)
def create_member(name, email, location):
    member = Member.objects.create(
        full_name=name,
        email=email,
        location=location
    )
    CreditWallet.objects.create(member=member, credits=0)
    return member


# 2. STORE DATA (Add Skill)
def add_skill(member, skill_name, description):
    return Skill.objects.create(
        member=member,
        skill_name=skill_name,
        description=description
    )


# 3. RETRIEVE DATA (My Offered Skills)
def get_member_skills(member):
    return Skill.objects.filter(member=member)


# 4. SEARCH DATA (Find Skills by Name)
def search_skills(keyword):
    return Skill.objects.filter(skill_name__icontains=keyword)


# 5. UPDATE DATA (Transfer Credits)
def transfer_credits(seeker, provider, hours):
    seeker_wallet = CreditWallet.objects.get(member=seeker)
    provider_wallet = CreditWallet.objects.get(member=provider)

    if seeker_wallet.credits >= hours:
        seeker_wallet.credits -= hours
        provider_wallet.credits += hours

        seeker_wallet.save()
        provider_wallet.save()

        return True
    return False


# 6. STORE SESSION DATA
def create_service_session(skill, seeker, provider, hours):
    return ServiceSession.objects.create(
        skill=skill,
        seeker=seeker,
        provider=provider,
        hours=hours,
        status="Completed"
    )


# 7. UPDATE DATA (Change Session Status)
def update_session_status(session, new_status):
    session.status = new_status
    session.save()
    return session


# 8. DELETE DATA (Remove Skill)
def delete_skill(skill):
    skill.delete()
