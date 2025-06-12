from flask import Blueprint, request, jsonify
from models import User, db
user_bp = Blueprint("user_bp", __name__)