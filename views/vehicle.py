from flask import Blueprint, request, jsonify
from models import Vehicle, db

vehicle_bp = Blueprint("vehicle_bp", __name__)

@vehicle_bp.route('/vehicles', methods=['GET'])
def get_vehicles():
    vehicles = Vehicle.query.all()
    return jsonify([v.to_dict() for v in vehicles]), 200

@vehicle_bp.route('/vehicles/<int:vehicle_id>', methods=['GET'])
def get_vehicle(vehicle_id):
    vehicle = Vehicle.query.filter_by(id=vehicle_id).first()
    if not vehicle:
        return jsonify({'error': 'Vehicle not found'}), 404
    return jsonify(vehicle.to_dict()), 200

@vehicle_bp.route('/vehicles', methods=['POST'])
def create_vehicle():
    data = request.get_json()
    if not data or 'make' not in data or 'model' not in data or 'year_of_manufacture' not in data or 'customer_id' not in data:
        return jsonify({'error': 'Missing required fields'}), 400

    new_vehicle = Vehicle(
        make=data['make'],
        model=data['model'],
        year_of_manufacture=data['year_of_manufacture'],
        customer_id=data['customer_id']
    )
    db.session.add(new_vehicle)
    db.session.commit()
    return jsonify(new_vehicle.to_dict()), 201

@vehicle_bp.route('/vehicles/<int:vehicle_id>', methods=['PUT'])
def update_vehicle(vehicle_id):
    vehicle = Vehicle.query.filter_by(id=vehicle_id).first()
    if not vehicle:
        return jsonify({'error': 'Vehicle not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    if 'make' in data:
        vehicle.make = data['make']
    if 'model' in data:
        vehicle.model = data['model']
    if 'year_of_manufacture' in data:
        vehicle.year_of_manufacture = data['year_of_manufacture']
    if 'customer_id' in data:
        vehicle.customer_id = data['customer_id']

    db.session.commit()
    return jsonify(vehicle.to_dict()), 200

@vehicle_bp.route('/vehicles/<int:vehicle_id>', methods=['DELETE'])
def delete_vehicle(vehicle_id):
    vehicle = Vehicle.query.filter_by(id=vehicle_id).first()
    if not vehicle:
        return jsonify({'error': 'Vehicle not found'}), 404
    db.session.delete(vehicle)
    db.session.commit()
    return jsonify({'message': 'Vehicle deleted successfully'}), 200
