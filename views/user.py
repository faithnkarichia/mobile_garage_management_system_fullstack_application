from flask import Blueprint, request, jsonify
from models import User, db, Customer, Admin, Mechanic
import re
from app import bcrypt
from app import app
from datetime import datetime, timedelta
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token

user_bp = Blueprint("user_bp", __name__)

# Utility to build dict representation


def user_to_dict(user):
    return {
        'id': user.id,
        'email': user.email,
        'role': user.role,
        'customer_id': user.customer_id,
        'admin_id': user.admin_id,
        'mechanic_id': user.mechanic_id
    }


@user_bp.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    if not users:
        return jsonify({'message': 'No users found'}), 404
    return jsonify([user_to_dict(u) for u in users]), 200


@user_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user_by_id(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(user_to_dict(user)), 200


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

    plaintext_password = data['password']

    hashed_password = bcrypt.generate_password_hash(
        plaintext_password).decode('utf-8')

    new_user = User(
        email=email,
        password=hashed_password,
        role=data['role'],
        customer_id=data.get('customer_id'),
        admin_id=data.get('admin_id'),
        mechanic_id=data.get('mechanic_id')
    )

    db.session.add(new_user)
    db.session.commit()
    return jsonify(user_to_dict(new_user)), 201


@user_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    user = User.query.get(user_id)
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
        plaintext_password = data['password']
        hashed_password = bcrypt.generate_password_hash(
            plaintext_password).decode('utf-8')
        user.password = hashed_password

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
    return jsonify(user_to_dict(user)), 200


@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Delete linked Customer, Mechanic, Admin if they exist
    if user.customer:
        db.session.delete(user.customer)
    if user.mechanic:
        db.session.delete(user.mechanic)
    if user.admin:
        db.session.delete(user.admin)

    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User and related records deleted successfully'}), 200


@user_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Email and password required'}), 400

    email = data['email'].strip().lower()
    password = data['password']

    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({'error': 'Invalid email or password'}), 401

    # Create JWT
    access_token = create_access_token(
        identity={'id': user.id, 'role': user.role},
        expires_delta=timedelta(hours=2)
    )

    return jsonify({'access_token': access_token}), 200
