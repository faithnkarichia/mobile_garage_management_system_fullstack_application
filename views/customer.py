from flask import Blueprint, request, jsonify
from models import Customer, db

customer_bp = Blueprint("customer_bp", __name__)

@customer_bp.route('/customers', methods=['GET'])
def get_customers():
    customers = Customer.query.all()
    return jsonify([c.to_dict() for c in customers]), 200

@customer_bp.route('/customers/<int:customer_id>', methods=['GET'])
def get_customer(customer_id):
    customer = Customer.query.filter_by(id=customer_id).first()
    if not customer:
        return jsonify({'error': 'Customer not found'}), 404
    return jsonify(customer.to_dict()), 200

@customer_bp.route('/customers', methods=['POST'])
def create_customer():
    data = request.get_json()
    if not data or 'name' not in data or 'phone_number' not in data or 'location' not in data:
        return jsonify({'error': 'Missing required fields'}), 400

    new_customer = Customer(
        name=data['name'],
        phone_number=data['phone_number'],
        location=data['location']
    )
    db.session.add(new_customer)
    db.session.commit()
    return jsonify(new_customer.to_dict()), 201

@customer_bp.route('/customers/<int:customer_id>', methods=['PUT'])
def update_customer(customer_id):
    customer = Customer.query.filter_by(id=customer_id).first()
    if not customer:
        return jsonify({'error': 'Customer not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    if 'name' in data:
        customer.name = data['name']
    if 'phone_number' in data:
        customer.phone_number = data['phone_number']
    if 'location' in data:
        customer.location = data['location']

    db.session.commit()
    return jsonify(customer.to_dict()), 200

@customer_bp.route('/customers/<int:customer_id>', methods=['DELETE'])
def delete_customer(customer_id):
    customer = Customer.query.filter_by(id=customer_id).first()
    if not customer:
        return jsonify({'error': 'Customer not found'}), 404
    db.session.delete(customer)
    db.session.commit()
    return jsonify({'message': 'Customer deleted successfully'}), 200
