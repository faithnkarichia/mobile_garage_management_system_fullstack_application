from flask import Blueprint, request, jsonify
from models import Admin, db
import re
from flask_jwt_extended import jwt_required, get_jwt_identity

admin_bp = Blueprint("admin_bp", __name__)


@admin_bp.route('/admins', methods=['GET'])
@jwt_required()
def get_admins():
    identity = get_jwt_identity()
    if identity['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403

    admins = Admin.query.all()
    if not admins:
        return jsonify({'message': 'No admins found'}), 404
    return jsonify([admin.to_dict() for admin in admins]), 200


@admin_bp.route('/admins/<int:admin_id>', methods=['GET'])
@jwt_required()
def get_admin_by_id(admin_id):
    identity = get_jwt_identity()
    if identity['role'] != 'admin' or identity['id'] != admin_id:
        return jsonify({'error': 'Unauthorized access'}), 403

    admin = Admin.query.filter_by(id=admin_id).first()
    if not admin:
        return jsonify({'error': 'Admin not found'}), 404
    return jsonify(admin.to_dict()), 200


@admin_bp.route('/admins/<int:admin_id>', methods=['PUT'])
@jwt_required()
def update_admin(admin_id):
    identity = get_jwt_identity()
    if identity['role'] != 'admin' or identity['id'] != admin_id:
        return jsonify({'error': 'Unauthorized access'}), 403

    admin = Admin.query.filter_by(id=admin_id).first()
    if not admin:
        return jsonify({'error': 'Admin not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    updated = False

    if 'name' in data:
        if not data['name'].strip():
            return jsonify({'error': 'Name cannot be empty'}), 400
        admin.name = data['name'].strip()
        updated = True

    if 'phone_number' in data:
        phone = data['phone_number'].strip()
        if not re.match(r'^\+?\d{10,15}$', phone):
            return jsonify({'error': 'Invalid phone number format'}), 400
        existing = Admin.query.filter_by(phone_number=phone).first()
        if existing and existing.id != admin.id:
            return jsonify({'error': 'Phone number already in use'}), 400
        admin.phone_number = phone
        updated = True

    if not updated:
        return jsonify({'error': 'No valid fields to update'}), 400

    db.session.commit()
    return jsonify(admin.to_dict()), 200


@admin_bp.route('/admins/<int:admin_id>', methods=['DELETE'])
@jwt_required()
def delete_admin(admin_id):
    identity = get_jwt_identity()
    if identity['role'] != 'admin' or identity['id'] != admin_id:
        return jsonify({'error': 'Unauthorized access'}), 403

    admin = Admin.query.filter_by(id=admin_id).first()
    if not admin:
        return jsonify({'error': 'Admin not found'}), 404

    db.session.delete(admin)
    db.session.commit()
    return jsonify({'message': 'Admin deleted successfully'}), 200


@admin_bp.route('/admins', methods=['POST'])
@jwt_required()
def create_admin():
    identity = get_jwt_identity()
    if identity['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403

    try:
        data = request.get_json()
        if not data or 'name' not in data or 'phone_number' not in data:
            return jsonify({'error': 'Invalid data'}), 400

        phone = data['phone_number'].strip()
        if not re.fullmatch(r'^\+?\d{10,15}$', phone):
            return jsonify({'error': 'Invalid phone number format'}), 400

        if Admin.query.filter_by(name=data['name'].strip()).first():
            return jsonify({'error': 'Admin with this name already exists'}), 409
        if Admin.query.filter_by(phone_number=phone).first():
            return jsonify({'error': 'Admin with this phone number already exists'}), 409

        new_admin = Admin(
            name=data['name'].strip(),
            phone_number=phone
        )
        db.session.add(new_admin)
        db.session.commit()
        return jsonify(new_admin.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500
