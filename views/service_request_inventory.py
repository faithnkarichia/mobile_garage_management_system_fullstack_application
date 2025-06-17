from flask import Blueprint, request, jsonify
from models import ServiceRequestInventory, db
from flask_jwt_extended import jwt_required, get_jwt_identity

service_request_inventory_bp = Blueprint("service_request_inventory_bp", __name__)

# Utility function for safe dict
def sri_to_dict(sri):
    return {
        'id': sri.id,
        'service_request_id': sri.service_request_id,
        'inventory_id': sri.inventory_id
    }

@service_request_inventory_bp.route('/service_request_inventories', methods=['GET'])
@jwt_required()
def get_sri_list():
    identity = get_jwt_identity()
    if identity['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403
    items = ServiceRequestInventory.query.all()
    if not items:
        return jsonify({'message': 'No service request inventory records found'}), 404
    return jsonify([sri_to_dict(item) for item in items]), 200

@service_request_inventory_bp.route('/service_request_inventories/<int:sri_id>', methods=['GET'])
@jwt_required()
def get_sri(sri_id):
    identity = get_jwt_identity()
    if identity['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403
    sri = ServiceRequestInventory.query.get(sri_id)
    if not sri:
        return jsonify({'error': 'Record not found'}), 404
    return jsonify(sri_to_dict(sri)), 200

@service_request_inventory_bp.route('/service_request_inventories', methods=['POST'])
@jwt_required()
def create_sri():
    identity = get_jwt_identity()

    if identity['role'] not in ['admin', 'mechanic']:
        return jsonify({'error': 'Unauthorized access'}), 403
    data = request.get_json()
    if not data or 'service_request_id' not in data or 'inventory_id' not in data:
        return jsonify({'error': 'Missing required fields'}), 400

    new_sri = ServiceRequestInventory(
        service_request_id=data['service_request_id'],
        inventory_id=data['inventory_id']
    )
    db.session.add(new_sri)
    db.session.commit()
    return jsonify(sri_to_dict(new_sri)), 201

@service_request_inventory_bp.route('/service_request_inventories/<int:sri_id>', methods=['PUT'])
@jwt_required()
def update_sri(sri_id):
    identity = get_jwt_identity()
    if identity['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403
    sri = ServiceRequestInventory.query.get(sri_id)
    if not sri:
        return jsonify({'error': 'Record not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    if 'service_request_id' in data:
        sri.service_request_id = data['service_request_id']
    if 'inventory_id' in data:
        sri.inventory_id = data['inventory_id']

    db.session.commit()
    return jsonify(sri_to_dict(sri)), 200

# @service_request_inventory_bp.route('/service_request_inventories/<int:sri_id>', methods=['DELETE'])
# def delete_sri(sri_id):
#     sri = ServiceRequestInventory.query.get(sri_id)
#     if not sri:
#         return jsonify({'error': 'Record not found'}), 404
#     db.session.delete(sri)
#     db.session.commit()
#     return jsonify({'message': 'Record deleted successfully'}), 200
