from flask import Blueprint, request, jsonify
from models import Vehicle, db,User
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func

vehicle_bp = Blueprint("vehicle_bp", __name__)


def vehicle_to_dict(vehicle):
    return {
        'id': vehicle.id,
        'make': vehicle.make,
        'model': vehicle.model,
        'year_of_manufacture': vehicle.year_of_manufacture,
        'customer_id': vehicle.customer_id
    }

@vehicle_bp.route('/vehicles', methods=['GET'])
@jwt_required()
def get_vehicles():
    identity = get_jwt_identity()
    if identity['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403
    vehicles = Vehicle.query.all()
    if not vehicles:
        return jsonify({'message': 'No vehicles found'}), 404
    return jsonify([vehicle_to_dict(v) for v in vehicles]), 200


@vehicle_bp.route('/vehicles/customer/<int:customer_id>', methods=['GET'])
@jwt_required()
def get_vehicles_by_customer(customer_id):
    identity = get_jwt_identity()

    # Only customers can access
    if identity['role'] != 'customer':
        return jsonify({'error': 'Unauthorized access'}), 403

    # ✅ Compare directly from the token
    if identity.get('customer_id') != customer_id:
        return jsonify({'error': 'You can only access your own vehicles'}), 403

    vehicles = Vehicle.query.filter_by(customer_id=customer_id).all()

    if not vehicles:
        return jsonify({'message': 'No vehicles found for this customer'}), 404

    return jsonify([vehicle_to_dict(v) for v in vehicles]), 200

@vehicle_bp.route('/vehicles/<int:vehicle_id>', methods=['GET'])
@jwt_required()
def get_vehicle(vehicle_id):
    identity = get_jwt_identity()
    if identity['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403
    vehicle = Vehicle.query.get(vehicle_id)
    if not vehicle:
        return jsonify({'error': 'Vehicle not found'}), 404
    return jsonify(vehicle_to_dict(vehicle)), 200

@vehicle_bp.route('/vehicles', methods=['POST'])
@jwt_required()
def create_vehicle():
    identity = get_jwt_identity()

    if identity['role'] != 'customer':
        return jsonify({'error': 'Unauthorized access'}), 403

    data = request.get_json()
    required_fields = ['make', 'model', 'year_of_manufacture']
    if not data or not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    # Convert year to integer for consistent comparison
    try:
        year = int(data['year_of_manufacture'])
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid year format'}), 400

    # Check for existing vehicle with all matching fields
    existing_vehicle = Vehicle.query.filter(
        func.lower(Vehicle.make) == func.lower(data['make']),
        func.lower(Vehicle.model) == func.lower(data['model']),
        Vehicle.year_of_manufacture == year,
        Vehicle.customer_id == identity['customer_id']
    ).first()

    if existing_vehicle:
        return jsonify({
            'exists': True,
            'message': 'Vehicle already exists',
            'vehicle': vehicle_to_dict(existing_vehicle)
        }), 200

    new_vehicle = Vehicle(
        make=data['make'].strip(),
        model=data['model'].strip(),
        year_of_manufacture=year,
        customer_id=identity['customer_id']
    )

    db.session.add(new_vehicle)
    db.session.commit()
    
    return jsonify({
        'exists': False,
        'message': 'Vehicle added successfully',
        'vehicle': vehicle_to_dict(new_vehicle)
    }), 201
@vehicle_bp.route('/vehicles/<int:vehicle_id>', methods=['PUT'])
@jwt_required()
def update_vehicle(vehicle_id):
    identity = get_jwt_identity()

    if identity['role'] != 'customer':
        return jsonify({'error': 'Unauthorized access'}), 403

    vehicle = Vehicle.query.get(vehicle_id)
    if not vehicle:
        return jsonify({'error': 'Vehicle not found'}), 404

    
    if vehicle.customer_id != identity['id']:
        return jsonify({'error': 'You can only update your own vehicles'}), 403

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    if 'make' in data:
        vehicle.make = data['make']
    if 'model' in data:
        vehicle.model = data['model']
    if 'year_of_manufacture' in data:
        vehicle.year_of_manufacture = data['year_of_manufacture']

    db.session.commit()
    return jsonify(vehicle_to_dict(vehicle)), 200


# @vehicle_bp.route('/vehicles/<int:vehicle_id>', methods=['DELETE'])
# def delete_vehicle(vehicle_id):
#     vehicle = Vehicle.query.get(vehicle_id)
#     if not vehicle:
#         return jsonify({'error': 'Vehicle not found'}), 404
#     db.session.delete(vehicle)
#     db.session.commit()
#     return jsonify({'message': 'Vehicle deleted successfully'}), 200
