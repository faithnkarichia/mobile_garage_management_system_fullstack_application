from flask import Blueprint, request, jsonify
from models import Admin, db
admin_bp = Blueprint("admin_bp", __name__)