from flask import Blueprint, request, jsonify
from models import Mechanic, db


mechanic_bp= Blueprint("mechanic_bp",__name__)