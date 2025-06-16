from flask import Blueprint, request, jsonify
from models import Inventory, db

inventory_bp = Blueprint("inventory_bp", __name__)

@inventory_bp.route('/inventories', methods=['GET'])
def get_inventories():
    items = Inventory.query.all()
    return jsonify([i.to_dict() for i in items]), 200

@inventory_bp.route('/inventories/<int:item_id>', methods=['GET'])
def get_inventory_item(item_id):
    item = Inventory.query.filter_by(id=item_id).first()
    if not item:
        return jsonify({'error': 'Inventory item not found'}), 404
    return jsonify(item.to_dict()), 200

@inventory_bp.route('/inventories', methods=['POST'])
def create_inventory_item():
    data = request.get_json()
    if not data or not all(field in data for field in ['name', 'quantity', 'price']):
        return jsonify({'error': 'Missing required fields'}), 400

    if not isinstance(data['quantity'], int) or data['quantity'] < 0:
        return jsonify({'error': 'Quantity must be a non-negative integer'}), 400

    if not isinstance(data['price'], (int, float)) or data['price'] < 0:
        return jsonify({'error': 'Price must be a non-negative number'}), 400

    new_item = Inventory(
        name=data['name'].strip(),
        quantity=data['quantity'],
        price=data['price']
    )
    db.session.add(new_item)
    db.session.commit()
    return jsonify(new_item.to_dict()), 201

@inventory_bp.route('/inventories/<int:item_id>', methods=['PUT'])
def update_inventory_item(item_id):
    item = Inventory.query.filter_by(id=item_id).first()
    if not item:
        return jsonify({'error': 'Inventory item not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    if 'name' in data:
        name = data['name'].strip()
        if not name:
            return jsonify({'error': 'Name cannot be empty'}), 400
        item.name = name

    if 'quantity' in data:
        if not isinstance(data['quantity'], int) or data['quantity'] < 0:
            return jsonify({'error': 'Quantity must be a non-negative integer'}), 400
        item.quantity = data['quantity']

    if 'price' in data:
        if not isinstance(data['price'], (int, float)) or data['price'] < 0:
            return jsonify({'error': 'Price must be a non-negative number'}), 400
        item.price = data['price']

    db.session.commit()
    return jsonify(item.to_dict()), 200

@inventory_bp.route('/inventories/<int:item_id>', methods=['DELETE'])
def delete_inventory_item(item_id):
    item = Inventory.query.filter_by(id=item_id).first()
    if not item:
        return jsonify({'error': 'Inventory item not found'}), 404
    db.session.delete(item)
    db.session.commit()
    return jsonify({'message': 'Inventory item deleted successfully'}), 200
