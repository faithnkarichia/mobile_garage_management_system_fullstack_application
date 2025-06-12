from flask import Blueprint, request, jsonify
from models import Customer, db
customer_bp = Blueprint("customer_bp", __name__)