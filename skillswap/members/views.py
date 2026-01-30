from django.shortcuts import render

def home(request):
    return render(request, 'member/index.html')  # EXACT folder name
