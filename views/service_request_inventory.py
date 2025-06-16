from flask import Blueprint, request, jsonify
from models import ServiceRequestInventory, db

service_request_inventory_bp = Blueprint("service_request_inventory_bp", __name__)

@service_request_inventory_bp.route('/service_request_inventories', methods=['GET'])
def get_sri_list():
    items = ServiceRequestInventory.query.all()
    return jsonify([sri.to_dict() for sri in items]), 200

@service_request_inventory_bp.route('/service_request_inventories/<int:sri_id>', methods=['GET'])
def get_sri(sri_id):
    sri = ServiceRequestInventory.query.filter_by(id=sri_id).first()
    if not sri:
        return jsonify({'error': 'Record not found'}), 404
    return jsonify(sri.to_dict()), 200

@service_request_inventory_bp.route('/service_request_inventories', methods=['POST'])
def create_sri():
    data = request.get_json()
    if not data or 'service_request_id' not in data or 'inventory_id' not in data:
        return jsonify({'error': 'Missing required fields'}), 400

    new_sri = ServiceRequestInventory(
        service_request_id=data['service_request_id'],
        inventory_id=data['inventory_id']
    )
    db.session.add(new_sri)
    db.session.commit()
    return jsonify(new_sri.to_dict()), 201

@service_request_inventory_bp.route('/service_request_inventories/<int:sri_id>', methods=['PUT'])
def update_sri(sri_id):
    sri = ServiceRequestInventory.query.filter_by(id=sri_id).first()
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
    return jsonify(sri.to_dict()), 200

@service_request_inventory_bp.route('/service_request_inventories/<int:sri_id>', methods=['DELETE'])
def delete_sri(sri_id):
    sri = ServiceRequestInventory.query.filter_by(id=sri_id).first()
    if not sri:
        return jsonify({'error': 'Record not found'}), 404
    db.session.delete(sri)
    db.session.commit()
    return jsonify({'message': 'Record deleted successfully'}), 200
