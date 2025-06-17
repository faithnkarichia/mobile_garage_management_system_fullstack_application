from flask import Blueprint, request, jsonify
from models import Customer, db
import re
from flask_jwt_extended import jwt_required, get_jwt_identity

customer_bp = Blueprint("customer_bp", __name__)

# GET all customers


@customer_bp.route('/customers', methods=['GET'])
@jwt_required()
def get_customers():
    identity = get_jwt_identity()
    if identity['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403
    customers = Customer.query.all()
    if not customers:
        return jsonify({'message': 'No customers found'}), 404

    customer_list = []
    for customer in customers:
        customer_list.append({
            'id': customer.id,
            'name': customer.name,
            'phone_number': customer.phone_number,
            'location': customer.location,
            'created_at': customer.created_at.strftime('%Y-%m-%d %H:%M:%S')
        })

    return jsonify(customer_list), 200


# GET single customer by ID
@customer_bp.route('/customers/<int:customer_id>', methods=['GET'])
def get_customer(customer_id):
    customer = Customer.query.filter_by(id=customer_id).first()
    if not customer:
        return jsonify({'error': 'Customer not found'}), 404

    customer_data = {
        'id': customer.id,
        'name': customer.name,
        'phone_number': customer.phone_number,
        'location': customer.location,
        'created_at': customer.created_at.strftime('%Y-%m-%d %H:%M:%S')
    }

    return jsonify(customer_data), 200


# CREATE customer
@customer_bp.route('/customers', methods=['POST'])
def create_customer():
    data = request.get_json()
    if not data or 'name' not in data or 'phone_number' not in data or 'location' not in data:
        return jsonify({'error': 'Missing required fields'}), 400

    name = data['name'].strip()
    phone = data['phone_number'].strip()
    location = data['location'].strip()

    if not name:
        return jsonify({'error': 'Name cannot be empty'}), 400
    if not location:
        return jsonify({'error': 'Location cannot be empty'}), 400
    if not re.fullmatch(r'^\+?\d{10,15}$', phone):
        return jsonify({'error': 'Invalid phone number format'}), 400

    # Duplicate checks
    if Customer.query.filter_by(name=name).first():
        return jsonify({'error': 'Customer with this name already exists'}), 409
    if Customer.query.filter_by(phone_number=phone).first():
        return jsonify({'error': 'Customer with this phone number already exists'}), 409

    new_customer = Customer(name=name, phone_number=phone, location=location)
    db.session.add(new_customer)
    db.session.commit()
    return jsonify(new_customer.to_dict()), 201

# UPDATE customer


@customer_bp.route('/customers/<int:customer_id>', methods=['PUT'])
@jwt_required()
def update_customer(customer_id):
    identity = get_jwt_identity()
    print(f"Identity: {identity}")  # Debugging line to check identity
    if identity['role'] != 'customer' or identity['id'] != customer_id:
        return jsonify({'error': 'Unauthorized access'}), 403
    customer = Customer.query.filter_by(id=customer_id).first()
    if not customer:
        return jsonify({'error': 'Customer not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    updated = False

    if 'name' in data:
        name = data['name'].strip()
        if not name:
            return jsonify({'error': 'Name cannot be empty'}), 400
        existing = Customer.query.filter_by(name=name).first()
        if existing and existing.id != customer.id:
            return jsonify({'error': 'Name already in use'}), 400
        customer.name = name
        updated = True

    if 'phone_number' in data:
        phone = data['phone_number'].strip()
        if not re.fullmatch(r'^\+?\d{10,15}$', phone):
            return jsonify({'error': 'Invalid phone number format'}), 400
        existing = Customer.query.filter_by(phone_number=phone).first()
        if existing and existing.id != customer.id:
            return jsonify({'error': 'Phone number already in use'}), 400
        customer.phone_number = phone
        updated = True

    if 'location' in data:
        location = data['location'].strip()
        if not location:
            return jsonify({'error': 'Location cannot be empty'}), 400
        customer.location = location
        updated = True

    if not updated:
        return jsonify({'error': 'No valid fields to update'}), 400

    db.session.commit()
    return jsonify({
        'id': customer.id,
        'name': customer.name,
        'phone_number': customer.phone_number,
        'location': customer.location,
        'created_at': customer.created_at.isoformat()
    }), 200

# # DELETE customer
# @customer_bp.route('/customers/<int:customer_id>', methods=['DELETE'])
# def delete_customer(customer_id):
#     customer = Customer.query.filter_by(id=customer_id).first()
#     if not customer:
#         return jsonify({'error': 'Customer not found'}), 404
#     db.session.delete(customer)
#     db.session.commit()
#     return jsonify({'message': 'Customer deleted successfully'}), 200
