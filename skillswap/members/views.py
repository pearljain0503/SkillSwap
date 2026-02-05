from django.shortcuts import render, redirect
from .models import Skill, Member
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt


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

        return render(request, 'index.html', {
            'skills': skills,
            'member': member,
        })

    return render(request, 'index.html', {
        'skills': [],
        'member': None,
    })



# CREATE → Add skill
def add_skill(request):
    if request.method == "POST":
        member = get_logged_in_member(request)

        if not member:
            return JsonResponse({"error": "Not logged in"}, status=403)

        Skill.objects.create(
            member=member,
            skill_name=request.POST.get('skill_name'),
            description=request.POST.get('description')
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

        return render(request, "index.html", {
            "login_error": "Invalid email or password"
        })


def signup_user(request):
    if request.method == "POST":
        name = request.POST.get("name")
        email = request.POST.get("email")
        password = request.POST.get("password")

        if User.objects.filter(username=email).exists():
            return render(request, "index.html", {
                "signup_error": "Email already exists"
            })

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

