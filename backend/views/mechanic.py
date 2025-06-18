from flask import Blueprint, request, jsonify
from models import Mechanic, db
import re
from flask_jwt_extended import jwt_required, get_jwt_identity                                                                                                                                                                                                                        

mechanic_bp = Blueprint("mechanic_bp", __name__)

# Utility function for safe dict
def mechanic_to_dict(mechanic):
    return {
        'id': mechanic.id,
        'name': mechanic.name,
        'speciality': mechanic.speciality,
        'location': mechanic.location,
        'phone_number': mechanic.phone_number,
        'created_at': mechanic.created_at.isoformat()
    }

@mechanic_bp.route('/mechanics', methods=['GET'])
@jwt_required()
def get_mechanics():
    identity = get_jwt_identity()
    # if identity['role'] not in ['admin', 'mechanic']:
    if identity['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403
    mechanics = Mechanic.query.all()
    if not mechanics:
        return jsonify({'message': 'No mechanics found'}), 404
    return jsonify([mechanic_to_dict(m) for m in mechanics]), 200

@mechanic_bp.route('/mechanics/<int:mechanic_id>', methods=['GET'])
@jwt_required()
def get_mechanic_by_id(mechanic_id):
    identity = get_jwt_identity()
    if identity['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403
    mechanic = Mechanic.query.get(mechanic_id)
    if not mechanic:
        return jsonify({'error': 'Mechanic not found'}), 404
    return jsonify(mechanic_to_dict(mechanic)), 200

@mechanic_bp.route('/mechanics', methods=['POST'])
@jwt_required()
def create_mechanic():
    identity = get_jwt_identity()
    if identity['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403
    try:
        data = request.get_json()
        if not data or not all(field in data for field in ['name', 'speciality', 'location', 'phone_number']):
            return jsonify({'error': 'Missing required fields'}), 400

        phone = data['phone_number'].strip()
        if not re.fullmatch(r'^\+?\d{10,15}$', phone):
            return jsonify({'error': 'Invalid phone number format'}), 400

        if Mechanic.query.filter_by(name=data['name'].strip()).first():
            return jsonify({'error': 'Mechanic with this name already exists'}), 409
        if Mechanic.query.filter_by(phone_number=phone).first():
            return jsonify({'error': 'Mechanic with this phone number already exists'}), 409

        new_mechanic = Mechanic(
            name=data['name'].strip(),
            speciality=data['speciality'].strip(),
            location=data['location'].strip(),
            phone_number=phone
        )
        db.session.add(new_mechanic)
        db.session.commit()
        return jsonify(mechanic_to_dict(new_mechanic)), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@mechanic_bp.route('/mechanics/<int:mechanic_id>', methods=['PUT'])
@jwt_required()
def update_mechanic(mechanic_id):
    identity = get_jwt_identity()
    if identity['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403
    mechanic = Mechanic.query.get(mechanic_id)
    if not mechanic:
        return jsonify({'error': 'Mechanic not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    updated = False

    if 'name' in data:
        name = data['name'].strip()
        if not name:
            return jsonify({'error': 'Name cannot be empty'}), 400
        mechanic.name = name
        updated = True

    if 'speciality' in data:
        speciality = data['speciality'].strip()
        if not speciality:
            return jsonify({'error': 'Speciality cannot be empty'}), 400
        mechanic.speciality = speciality
        updated = True

    if 'location' in data:
        location = data['location'].strip()
        if not location:
            return jsonify({'error': 'Location cannot be empty'}), 400
        mechanic.location = location
        updated = True

    if 'phone_number' in data:
        phone = data['phone_number'].strip()
        if not re.fullmatch(r'^\+?\d{10,15}$', phone):
            return jsonify({'error': 'Invalid phone number format'}), 400
        existing = Mechanic.query.filter_by(phone_number=phone).first()
        if existing and existing.id != mechanic.id:
            return jsonify({'error': 'Phone number already in use'}), 409
        mechanic.phone_number = phone
        updated = True

    if not updated:
        return jsonify({'error': 'No valid fields to update'}), 400

    db.session.commit()
    return jsonify(mechanic_to_dict(mechanic)), 200

# @mechanic_bp.route('/mechanics/<int:id>/assign')


# @mechanic_bp.route('/mechanics/<int:mechanic_id>', methods=['DELETE'])
# def delete_mechanic(mechanic_id):
#     mechanic = Mechanic.query.get(mechanic_id)
#     if not mechanic:
#         return jsonify({'error': 'Mechanic not found'}), 404
#     db.session.delete(mechanic)
#     db.session.commit()
#     return jsonify({'message': 'Mechanic deleted successfully'}), 200
