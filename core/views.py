from django.shortcuts import render,redirect
from django.http import JsonResponse
from firebase_admin import auth as firebase_auth
import json

# Render login page
def login_view(request):
    return render(request, "login.html")

def learn(request):
    return render(request, "learn.html")

# Verify Firebase token
def verify_token(request):
    if request.method == "POST":
        body = json.loads(request.body.decode("utf-8"))
        token = body.get("token")
        try:
            decoded_token = firebase_auth.verify_id_token(token)
            uid = decoded_token["uid"]
            email = decoded_token["email"]
            return JsonResponse({"status": "success", "uid": uid, "email": email})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=401)
    return JsonResponse({"status": "error", "message": "Invalid request"}, status=400)


def test_api(request):
    return JsonResponse({"message": "Backend is working!"})

def kolam_tales(request):
    return render(request, 'kolam-tales.html')

def index(request):
    return render(request, "index.html")

def about(request):
    return render(request, "about.html")

def main(request):
    return render(request, "main.html")
