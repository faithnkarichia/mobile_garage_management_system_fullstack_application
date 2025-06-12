from flask import Blueprint, request, jsonify
from models import Inventory, db



inventory_bp = Blueprint("inventory_bp", __name__)