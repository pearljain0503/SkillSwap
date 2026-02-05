from django.shortcuts import render, redirect, get_object_or_404
from .models import Skill, Member, SkillRequest, Message, ServiceSession
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q
import json
from collections import defaultdict

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


def _build_requests_payload(member):
    if not member:
        return []

    requests_payload = []
    incoming = SkillRequest.objects.select_related(
        "skill", "requester", "provider"
    ).filter(provider=member)
    outgoing = SkillRequest.objects.select_related(
        "skill", "requester", "provider"
    ).filter(requester=member)

    def safe_avatar(name):
        name = (name or "").strip()
        return name[0].upper() if name else "?"

    for req in incoming:
        requests_payload.append(
            {
                "id": req.request_id,
                "type": "incoming",
                "skill": req.skill.skill_name if req.skill else "Skill",
                "from": req.requester.full_name if req.requester else "Unknown",
                "avatar": safe_avatar(req.requester.full_name if req.requester else ""),
                "status": req.status,
                "date": req.created_at.strftime("%b %d, %Y"),
                "message": req.note or "Wants to learn your skill.",
            }
        )

    for req in outgoing:
        requests_payload.append(
            {
                "id": req.request_id,
                "type": "outgoing",
                "skill": req.skill.skill_name if req.skill else "Skill",
                "to": req.provider.full_name if req.provider else "Unknown",
                "avatar": safe_avatar(req.provider.full_name if req.provider else ""),
                "status": req.status,
                "date": req.created_at.strftime("%b %d, %Y"),
                "message": req.note or "You requested this skill.",
            }
        )

    return requests_payload


def _build_conversations_payload(member):
    if not member:
        return [], {}

    requests = list(
        SkillRequest.objects.select_related("skill", "requester", "provider")
        .filter(Q(requester=member) | Q(provider=member))
        .order_by("-created_at")
    )

    messages = (
        Message.objects.select_related("sender", "request")
        .filter(request__in=requests)
        .order_by("created_at")
    )

    messages_by_request = defaultdict(list)
    for msg in messages:
        messages_by_request[msg.request_id].append(msg)

    def safe_avatar(name):
        name = (name or "").strip()
        return name[0].upper() if name else "?"

    conversations = []
    messages_payload = {}

    for req in requests:
        other = req.provider if req.requester_id == member.member_id else req.requester
        other_name = other.full_name if other else "Unknown"
        avatar = safe_avatar(other_name)

        req_messages = messages_by_request.get(req.request_id, [])
        if not req_messages and req.note:
            req_messages = [
                Message(
                    message_id=0,
                    request=req,
                    sender=req.requester,
                    text=req.note,
                    created_at=req.created_at,
                )
            ]

        last_message = req_messages[-1] if req_messages else None
        last_text = last_message.text if last_message else "No messages yet"
        last_time = (
            last_message.created_at if last_message else req.created_at
        ).strftime("%b %d, %Y")

        conversations.append(
            {
                "id": req.request_id,
                "name": other_name,
                "avatar": avatar,
                "lastMessage": last_text,
                "time": last_time,
                "unread": 0,
                "status": "offline",
                "requestStatus": req.status,
            }
        )

        messages_payload[req.request_id] = [
            {
                "id": msg.message_id,
                "text": msg.text,
                "sent": msg.sender_id == member.member_id,
                "time": msg.created_at.strftime("%I:%M %p").lstrip("0"),
            }
            for msg in req_messages
        ]

    return conversations, messages_payload


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

    conversations_payload, messages_payload = _build_conversations_payload(member)
    pending_requests_count = (
        SkillRequest.objects.filter(provider=member, status="pending").count()
        if member
        else 0
    )
    offers_count = (
        Skill.objects.filter(member=member).count() if member else 0
    )
    total_requests_count = (
        SkillRequest.objects.filter(Q(requester=member) | Q(provider=member)).count()
        if member
        else 0
    )
    completed_sessions_count = (
        ServiceSession.objects.filter(Q(seeker=member) | Q(provider=member))
        .filter(Q(status__iexact="accepted") | Q(status__iexact="completed"))
        .count()
        if member
        else 0
    )

    context = {
        "skills": skills,
        "member": member,
        "current_member_id": member.member_id if member else None,
        "all_skills_json": skills_payload,
        "requests_json": _build_requests_payload(member),
        "conversations_json": conversations_payload,
        "messages_json": messages_payload,
        "pending_requests_count": pending_requests_count,
        "offers_count": offers_count,
        "total_requests_count": total_requests_count,
        "completed_sessions_count": completed_sessions_count,
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


def request_skill(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method"}, status=405)

    member = get_logged_in_member(request)
    if not member:
        return JsonResponse({"error": "Not logged in"}, status=403)

    try:
        data = json.loads(request.body.decode("utf-8")) if request.body else {}
    except json.JSONDecodeError:
        data = {}

    skill_id = data.get("skill_id") or request.POST.get("skill_id")
    note = (data.get("note") or request.POST.get("note") or "").strip()
    if not skill_id:
        return JsonResponse({"error": "Skill ID missing"}, status=400)

    skill = get_object_or_404(Skill, skill_id=skill_id)
    if skill.member == member:
        return JsonResponse({"error": "Cannot request your own skill"}, status=400)

    existing = (
        SkillRequest.objects.filter(skill=skill, requester=member)
        .order_by("-created_at")
        .first()
    )
    if existing and existing.status in ["pending", "accepted"]:
        return JsonResponse(
            {
                "request_id": existing.request_id,
                "status": existing.status,
                "message": "Request already exists",
            }
        )

    new_request = SkillRequest.objects.create(
        skill=skill,
        requester=member,
        provider=skill.member,
        status="pending",
        note=note,
    )

    if note:
        Message.objects.create(request=new_request, sender=member, text=note)

    return JsonResponse(
        {
            "request_id": new_request.request_id,
            "status": new_request.status,
        }
    )


def update_request(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method"}, status=405)

    member = get_logged_in_member(request)
    if not member:
        return JsonResponse({"error": "Not logged in"}, status=403)

    try:
        data = json.loads(request.body.decode("utf-8")) if request.body else {}
    except json.JSONDecodeError:
        data = {}

    request_id = data.get("request_id") or request.POST.get("request_id")
    action = data.get("action") or request.POST.get("action")

    if not request_id or action not in ["accept", "decline"]:
        return JsonResponse({"error": "Invalid request data"}, status=400)

    skill_request = get_object_or_404(SkillRequest, request_id=request_id)

    if skill_request.provider != member:
        return JsonResponse({"error": "Unauthorized"}, status=403)

    skill_request.status = "accepted" if action == "accept" else "declined"
    skill_request.save()

    if skill_request.status == "accepted":
        ServiceSession.objects.get_or_create(
            request=skill_request,
            defaults={
                "skill": skill_request.skill,
                "seeker": skill_request.requester,
                "provider": skill_request.provider,
                "hours": 1,
                "status": "Accepted",
            },
        )

    return JsonResponse({"status": skill_request.status})


def send_message(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method"}, status=405)

    member = get_logged_in_member(request)
    if not member:
        return JsonResponse({"error": "Not logged in"}, status=403)

    try:
        data = json.loads(request.body.decode("utf-8")) if request.body else {}
    except json.JSONDecodeError:
        data = {}

    request_id = data.get("request_id") or request.POST.get("request_id")
    text = (data.get("text") or request.POST.get("text") or "").strip()

    if not request_id or not text:
        return JsonResponse({"error": "Message text required"}, status=400)

    skill_request = get_object_or_404(SkillRequest, request_id=request_id)
    if skill_request.requester != member and skill_request.provider != member:
        return JsonResponse({"error": "Unauthorized"}, status=403)

    message = Message.objects.create(
        request=skill_request,
        sender=member,
        text=text,
    )

    return JsonResponse(
        {
            "id": message.message_id,
            "text": message.text,
            "time": message.created_at.strftime("%I:%M %p").lstrip("0"),
        }
    )


def sync_data(request):
    if request.method != "GET":
        return JsonResponse({"error": "Invalid request method"}, status=405)

    member = get_logged_in_member(request)
    if not member:
        return JsonResponse({"error": "Not logged in"}, status=403)

    conversations_payload, messages_payload = _build_conversations_payload(member)

    return JsonResponse(
        {
            "requests": _build_requests_payload(member),
            "conversations": conversations_payload,
            "messages": messages_payload,
        }
    )



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
