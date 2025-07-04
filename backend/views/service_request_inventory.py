from flask import Blueprint, request, jsonify
from models import ServiceRequestInventory, db
from flask_jwt_extended import jwt_required, get_jwt_identity

service_request_inventory_bp = Blueprint("service_request_inventory_bp", __name__)

# Utility function for safe dict
def sri_to_dict(sri):
    return {
        'id': sri.id,
        'service_request_id': sri.service_request_id,
        'inventory_id': sri.inventory_id,
        'used_quantity': sri.used_quantity
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
    print("Incoming data:", data)

    if not data or 'service_request_id' not in data or 'inventory_id' not in data or 'used_quantity' not in data:
        return jsonify({'error': 'Missing required fields'}), 400

    # Check if service request exists
    from models import ServiceRequest  
    service_request = ServiceRequest.query.get(data['service_request_id'])
    if not service_request:
        return jsonify({'error': 'Service request not found'}), 404

    # Check if inventory exists
    from models import Inventory
    inventory = Inventory.query.get(data['inventory_id'])
    if not inventory:
        return jsonify({'error': 'Inventory item not found'}), 404

    # Check if item already exists for this service request
    existing = ServiceRequestInventory.query.filter_by(
        service_request_id=data['service_request_id'],
        inventory_id=data['inventory_id']
    ).first()

    if existing:
        existing.used_quantity += data['used_quantity']
        db.session.commit()
        return jsonify(sri_to_dict(existing)), 200
    else:
        new_sri = ServiceRequestInventory(
            service_request_id=data['service_request_id'],
            inventory_id=data['inventory_id'],
            used_quantity=data['used_quantity']
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
    if 'used_quantity' in data:
        sri.used_quantity = data['used_quantity']

    db.session.commit()
    return jsonify(sri_to_dict(sri)), 200


# @service_request_inventory_bp.route('/service_request_inventories/<int:sri_id>', methods=['DELETE'])
# @jwt_required()
# def delete_sri(sri_id):
#     identity = get_jwt_identity()
#     if identity['role'] != 'admin':
#         return jsonify({'error': 'Unauthorized access'}), 403
#     sri = ServiceRequestInventory.query.get(sri_id)
#     if not sri:
#         return jsonify({'error': 'Record not found'}), 404
#     db.session.delete(sri)
#     db.session.commit()
#     return jsonify({'message': 'Record deleted successfully'}), 200
