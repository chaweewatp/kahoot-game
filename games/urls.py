from django.urls import path, include
from . import views



urlpatterns = [
    path('', views.index, name='index'),
    path('game/<game_key>', views.registerName, name='registerName'),
    path('waitingRoom/<game_key>_<uid>', views.waitingRoom, name='waitingRoom'),
    path('playGame/<game_key>_<question_id>_<uid>', views.playGame, name='playGame'),
    path('endgame/', views.endgame, name='endgame'),

]