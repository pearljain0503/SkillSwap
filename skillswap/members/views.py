from django.shortcuts import render, redirect
from .models import Skill, Member
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

def _parse_float(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None

def _parse_int(value, default=1):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _build_index_context(member, skills, extra=None):
    all_skills = Skill.objects.select_related("member").all()
    skills_payload = [
        {
            "id": skill.skill_id,
            "skill_name": skill.skill_name,
            "description": skill.description,
            "category": skill.category,
            "rate": skill.rate,
            "rating": float(skill.rating) if skill.rating is not None else None,
            "latitude": skill.latitude,
            "longitude": skill.longitude,
            "member_id": skill.member.member_id if skill.member else None,
            "member_email": skill.member.email if skill.member else None,
            "member_name": skill.member.full_name if skill.member else "Unknown",
        }
        for skill in all_skills
    ]

    context = {
        "skills": skills,
        "member": member,
        "current_member_id": member.member_id if member else None,
        "all_skills_json": skills_payload,
    }

    if extra:
        context.update(extra)

    return context


def get_logged_in_member(request):
    if not request.user.is_authenticated:
        return None
    
    if request.user.is_superuser:
        return None

    member, _ = Member.objects.get_or_create(
        email=request.user.email,
        defaults={
            "full_name": request.user.username,
            "location": "Not set"
        }
    )
    return member


# READ → Show logged-in user's skills
def index(request):
    if request.user.is_authenticated:
        member = get_logged_in_member(request)
        skills = Skill.objects.filter(member=member)
    else:
        member = None
        skills = []

    return render(request, "index.html", _build_index_context(member, skills))



# CREATE → Add skill
def add_skill(request):
    if request.method == "POST":
        member = get_logged_in_member(request)

        if not member:
            return JsonResponse({"error": "Not logged in"}, status=403)

        Skill.objects.create(
            member=member,
            skill_name=request.POST.get('skill_name'),
            description=request.POST.get('description'),
            category=request.POST.get('category') or "education",
            rate=_parse_int(request.POST.get('rate'), default=1),
            rating=_parse_float(request.POST.get('rating')) or 5.0,
            latitude=_parse_float(request.POST.get('latitude')),
            longitude=_parse_float(request.POST.get('longitude')),
        )

    return redirect('index')



# DELETE → Remove skill (only owner can delete)
def delete_skill(request, skill_id):
    member = get_logged_in_member(request)

    if not member:
        return redirect('index')

    Skill.objects.filter(
        skill_id=skill_id,
        member=member
    ).delete()

    return redirect('index')


@csrf_exempt
def login_user(request):
    if request.method == "POST":
        email = request.POST.get("email")
        password = request.POST.get("password")

        user = authenticate(request, username=email, password=password)

        if user:
            login(request, user)
            return redirect("index")

        member = get_logged_in_member(request)
        skills = Skill.objects.filter(member=member) if member else []
        return render(
            request,
            "index.html",
            _build_index_context(
                member,
                skills,
                {"login_error": "Invalid email or password"},
            ),
        )


def signup_user(request):
    if request.method == "POST":
        name = request.POST.get("name")
        email = request.POST.get("email")
        password = request.POST.get("password")

        if User.objects.filter(username=email).exists():
            member = get_logged_in_member(request)
            skills = Skill.objects.filter(member=member) if member else []
            return render(
                request,
                "index.html",
                _build_index_context(
                    member,
                    skills,
                    {"signup_error": "Email already exists"},
                ),
            )

        user = User.objects.create_user(
            username=email,   # REQUIRED
            email=email,
            password=password
        )

        Member.objects.create(
            full_name=name,
            email=email,
            location="Not set"
        )

        login(request, user)
        return redirect("index")   # ✅ MAIN PAGE

def logout_user(request):
    logout(request)
    return redirect("index")
