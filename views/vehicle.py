from flask import Blueprint, request, jsonify
from models import Vehicle, db
vehicle_bp = Blueprint("vehicle_bp", __name__)