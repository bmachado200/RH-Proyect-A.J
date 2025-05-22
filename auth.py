from functools import wraps
from flask import redirect, session, flash
from authlib.integrations.flask_client import OAuth
from dotenv import load_dotenv
import os

load_dotenv()

oauth = OAuth()

def init_auth(app):
    if not app:
        raise ValueError("Flask app cannot be None")
    
    oauth.init_app(app)  # Initialize OAuth with Flask app first
    
    auth0 = oauth.register(
        'auth0',
        client_id=os.getenv("AUTH0_CLIENT_ID"),
        client_secret=os.getenv("AUTH0_CLIENT_SECRET"),
        api_base_url=f'https://{os.getenv("AUTH0_DOMAIN")}',
        access_token_url=f'https://{os.getenv("AUTH0_DOMAIN")}/oauth/token',
        authorize_url=f'https://{os.getenv("AUTH0_DOMAIN")}/authorize',
        jwks_uri=f'https://{os.getenv("AUTH0_DOMAIN")}/.well-known/jwks.json',
        client_kwargs={
            'scope': 'openid profile email',
        },
        server_metadata_url=f'https://{os.getenv("AUTH0_DOMAIN")}/.well-known/openid-configuration'
    )
    return auth0

def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'profile' not in session:
            flash("Please log in to access this page.", "error")
            return redirect('/login')
        
        allowed_domain = os.getenv("ALLOWED_DOMAIN", "gmail.com")
        user_email = session['profile'].get('email', '')
        
        if not user_email.endswith(f'@{allowed_domain}'):
            flash(f"Invalid credentials. Only @{allowed_domain} emails are allowed.", "error")
            return redirect('/logout')
            
        return f(*args, **kwargs)
    return decorated