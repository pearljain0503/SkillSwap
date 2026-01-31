from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader

def home(request):
    return render(request, 'index.html') # EXACT folder name

def members(request) :
    return HttpResponse("Hello world")
    # template = loader.get_template('myfirst.html')
    # return HttpResponse(template.render())
# Create your views here.

