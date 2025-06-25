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
        'specialty': mechanic.specialty,
        'location': mechanic.location,
        'phone_number': mechanic.phone_number,
        'status': mechanic.status,
        'email': mechanic.email,
        'experience_years': mechanic.experience_years,
        'rating': mechanic.rating,
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
        if not data or not all(field in data for field in ['name', 'specialty', 'location', 'phone_number', 'email', 'experience_years','status']):
            return jsonify({'error': 'Missing required fields'}), 400

        phone = data['phone_number'].strip()
        if not re.fullmatch(r'^\+?\d{10,15}$', phone):
            return jsonify({'error': 'Invalid phone number format'}), 400

        if Mechanic.query.filter_by(name=data['name'].strip()).first():
            return jsonify({'error': 'Mechanic with this name already exists'}), 409
        if Mechanic.query.filter_by(phone_number=phone).first():
            return jsonify({'error': 'Mechanic with this phone number already exists'}), 409
        if Mechanic.query.filter_by(email=data['email'].strip()).first():
            return jsonify({'error': 'Mechanic with this email already exists'}), 409
        if not re.fullmatch(r'^[\w\.-]+@[\w\.-]+\.\w+$', data['email'].strip()):
            return jsonify({'error': 'Invalid email format'}), 400
        if not isinstance(data['experience_years'], int) or data['experience_years'] < 0:
            return jsonify({'error': 'Experience years must be a non-negative integer'}), 400
        if data['status'].strip().title() not in ['Available', 'Unavailable']:
            return jsonify({'error': 'Status must be either Available or Unavailable'}), 400

        new_mechanic = Mechanic(
            name=data['name'].strip(),
            specialty=data['specialty'].strip(),
            location=data['location'].strip(),
            phone_number=phone,
            email=data['email'].strip(),
            experience_years=data['experience_years'],
            status=data['status'].strip(),
            rating=data.get('rating', None),  # Optional field
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

    if 'specialty' in data:
        specialty = data['specialty'].strip()
        if not specialty:
            return jsonify({'error': 'Specialty cannot be empty'}), 400
        mechanic.specialty = specialty
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

    if 'email' in data:
        email = data['email'].strip()
        if not re.fullmatch(r'^[\w\.-]+@[\w\.-]+\.\w+$', email):
            return jsonify({'error': 'Invalid email format'}), 400
        existing = Mechanic.query.filter_by(email=email).first()
        if existing and existing.id != mechanic.id:
            return jsonify({'error': 'Email already in use'}), 409
        mechanic.email = email
        updated = True
    if 'experience_years' in data:
        experience_years = data['experience_years']
        if not isinstance(experience_years, int) or experience_years < 0:
            return jsonify({'error': 'Experience years must be a non-negative integer'}), 400
        mechanic.experience_years = experience_years
        updated = True
    if 'status' in data:
        status = data['status'].strip()
        if status not in ['Available', 'Unavailable']:
            return jsonify({'error': 'Status must be either Available or Unavailable'}), 400
        mechanic.status = status
        updated = True
    if 'rating' in data:
        rating = data['rating']
        if rating is not None and (not isinstance(rating, (int, float)) or rating < 0 or rating > 5):
            return jsonify({'error': 'Rating must be a number between 0 and 5'}), 400
        mechanic.rating = rating
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
