from flask import Blueprint, request, jsonify
from models import User, db
import re

user_bp = Blueprint("user_bp", __name__)

@user_bp.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([u.to_dict() for u in users]), 200

@user_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user_by_id(user_id):
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(user.to_dict()), 200

@user_bp.route('/users', methods=['POST'])
def create_user():
    data = request.get_json()
    required_fields = ['email', 'password', 'role']
    if not data or not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    email = data['email'].strip().lower()
    if not re.fullmatch(r'^[^@]+@[^@]+\.[^@]+$', email):
        return jsonify({'error': 'Invalid email format'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 409

    if data['role'] not in ['customer', 'admin', 'mechanic']:
        return jsonify({'error': 'Invalid role'}), 400

    new_user = User(
        email=email,
        password=data['password'],  # In production hash this!
        role=data['role'],
        customer_id=data.get('customer_id'),
        admin_id=data.get('admin_id'),
        mechanic_id=data.get('mechanic_id')
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify(new_user.to_dict()), 201

@user_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    if 'email' in data:
        email = data['email'].strip().lower()
        if not re.fullmatch(r'^[^@]+@[^@]+\.[^@]+$', email):
            return jsonify({'error': 'Invalid email format'}), 400
        if User.query.filter(User.email == email, User.id != user.id).first():
            return jsonify({'error': 'Email already in use'}), 409
        user.email = email

    if 'password' in data:
        user.password = data['password']

    if 'role' in data:
        if data['role'] not in ['customer', 'admin', 'mechanic']:
            return jsonify({'error': 'Invalid role'}), 400
        user.role = data['role']

    if 'customer_id' in data:
        user.customer_id = data['customer_id']

    if 'admin_id' in data:
        user.admin_id = data['admin_id']

    if 'mechanic_id' in data:
        user.mechanic_id = data['mechanic_id']

    db.session.commit()
    return jsonify(user.to_dict()), 200

@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted successfully'}), 200
