from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('add-skill/', views.add_skill, name='add_skill'),
    path('delete-skill/<int:skill_id>/', views.delete_skill, name='delete_skill'),

    path('login/', views.login_user, name='login_user'),
    path('signup/', views.signup_user, name='signup_user'),
    path('logout/', views.logout_user, name='logout_user'),

]