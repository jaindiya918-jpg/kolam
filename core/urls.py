from django.urls import path
from . import views
from .views import verify_token


urlpatterns = [
        path('', views.index, name='index'),
    path("login/", views.login_view, name="login"),
    path("api/verify-token/", views.verify_token, name="verify_token"),
    path('api/test/', views.test_api, name='test_api'),
    path('index/', views.index, name='index_page'),  # Added index route
    path('main.html', views.main, name='main'),    # Added main route
    path('about.html', views.about, name='about'), 
    path("learn.html", views.learn, name="learn"), 
      path('kolam-tales.html', views.kolam_tales, name='kolam_tales'),  
    
]