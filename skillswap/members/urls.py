from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('add-skill/', views.add_skill, name='add_skill'),
    path('delete-skill/<int:skill_id>/', views.delete_skill, name='delete_skill'),
    path('request-skill/', views.request_skill, name='request_skill'),
    path('update-request/', views.update_request, name='update_request'),
    path('send-message/', views.send_message, name='send_message'),
    path('sync-data/', views.sync_data, name='sync_data'),
    path("complete-session/", views.complete_session, name="complete_session"),

    path('login/', views.login_user, name='login_user'),
    path('signup/', views.signup_user, name='signup_user'),
    path('logout/', views.logout_user, name='logout_user'),

]
