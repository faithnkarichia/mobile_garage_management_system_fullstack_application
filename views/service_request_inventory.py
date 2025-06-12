from flask import Blueprint, request,jsonify
from models import ServiceRequestInventory, db


service_request_inventory_bp= Blueprint('service_request_inventory_bp', __name__)