from flask import Blueprint, request, jsonify
from models import Mechanic, db
import re

mechanic_bp = Blueprint("mechanic_bp", __name__)

@mechanic_bp.route('/mechanics', methods=['GET'])
def get_mechanics():
    mechanics = Mechanic.query.all()
    return jsonify([m.to_dict() for m in mechanics]), 200

@mechanic_bp.route('/mechanics/<int:mechanic_id>', methods=['GET'])
def get_mechanic_by_id(mechanic_id):
    mechanic = Mechanic.query.filter_by(id=mechanic_id).first()
    if not mechanic:
        return jsonify({'error': 'Mechanic not found'}), 404
    return jsonify(mechanic.to_dict()), 200

@mechanic_bp.route('/mechanics', methods=['POST'])
def create_mechanic():
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
        return jsonify(new_mechanic.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@mechanic_bp.route('/mechanics/<int:mechanic_id>', methods=['PUT'])
def update_mechanic(mechanic_id):
    mechanic = Mechanic.query.filter_by(id=mechanic_id).first()
    if not mechanic:
        return jsonify({'error': 'Mechanic not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    updated = False

    if 'name' in data:
        if not data['name'].strip():
            return jsonify({'error': 'Name cannot be empty'}), 400
        mechanic.name = data['name'].strip()
        updated = True

    if 'speciality' in data:
        if not data['speciality'].strip():
            return jsonify({'error': 'Speciality cannot be empty'}), 400
        mechanic.speciality = data['speciality'].strip()
        updated = True

    if 'location' in data:
        if not data['location'].strip():
            return jsonify({'error': 'Location cannot be empty'}), 400
        mechanic.location = data['location'].strip()
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
    return jsonify(mechanic.to_dict()), 200

@mechanic_bp.route('/mechanics/<int:mechanic_id>', methods=['DELETE'])
def delete_mechanic(mechanic_id):
    mechanic = Mechanic.query.filter_by(id=mechanic_id).first()
    if not mechanic:
        return jsonify({'error': 'Mechanic not found'}), 404

    db.session.delete(mechanic)
    db.session.commit()
    return jsonify({'message': 'Mechanic deleted successfully'}), 200
