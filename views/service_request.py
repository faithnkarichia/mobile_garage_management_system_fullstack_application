from flask import Blueprint, request, jsonify
from models import ServiceRequest, db

service_request_bp = Blueprint("service_request_bp", __name__)