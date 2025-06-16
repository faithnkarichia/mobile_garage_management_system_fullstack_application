from flask import Blueprint, request, jsonify
from models import Inventory, db

inventory_bp = Blueprint("inventory_bp", __name__)

# GET all inventory items
@inventory_bp.route('/inventories', methods=['GET'])
def get_inventories():
    items = Inventory.query.all()
    if not items:
        return jsonify({'message': 'No inventory items found'}), 404

    inventory_list = []
    for item in items:
        inventory_list.append({
            'id': item.id,
            'name': item.name,
            'quantity': item.quantity,
            'price': item.price,
            'created_at': item.created_at.strftime('%Y-%m-%d %H:%M:%S')
        })

    return jsonify(inventory_list), 200

# GET single inventory item
@inventory_bp.route('/inventories/<int:item_id>', methods=['GET'])
def get_inventory_item(item_id):
    item = Inventory.query.filter_by(id=item_id).first()
    if not item:
        return jsonify({'error': 'Inventory item not found'}), 404

    item_data = {
        'id': item.id,
        'name': item.name,
        'quantity': item.quantity,
        'price': item.price,
        'created_at': item.created_at.strftime('%Y-%m-%d %H:%M:%S')
    }

    return jsonify(item_data), 200

# CREATE inventory item
@inventory_bp.route('/inventories', methods=['POST'])
def create_inventory_item():
    data = request.get_json()
    if not data or not all(field in data for field in ['name', 'quantity', 'price']):
        return jsonify({'error': 'Missing required fields'}), 400

    name = data['name'].strip()
    if not name:
        return jsonify({'error': 'Name cannot be empty'}), 400

    quantity = data['quantity']
    price = data['price']

    if not isinstance(quantity, int) or quantity < 0:
        return jsonify({'error': 'Quantity must be a non-negative integer'}), 400

    if not isinstance(price, (int, float)) or price < 0:
        return jsonify({'error': 'Price must be a non-negative number'}), 400

    new_item = Inventory(name=name, quantity=quantity, price=price)
    db.session.add(new_item)
    db.session.commit()

    item_data = {
        'id': new_item.id,
        'name': new_item.name,
        'quantity': new_item.quantity,
        'price': new_item.price,
        'created_at': new_item.created_at.strftime('%Y-%m-%d %H:%M:%S')
    }

    return jsonify(item_data), 201

# UPDATE inventory item
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
        quantity = data['quantity']
        if not isinstance(quantity, int) or quantity < 0:
            return jsonify({'error': 'Quantity must be a non-negative integer'}), 400
        item.quantity = quantity

    if 'price' in data:
        price = data['price']
        if not isinstance(price, (int, float)) or price < 0:
            return jsonify({'error': 'Price must be a non-negative number'}), 400
        item.price = price

    db.session.commit()

    item_data = {
        'id': item.id,
        'name': item.name,
        'quantity': item.quantity,
        'price': item.price,
        'created_at': item.created_at.strftime('%Y-%m-%d %H:%M:%S')
    }

    return jsonify(item_data), 200

@inventory_bp.route('/inventories/<int:item_id>', methods=['DELETE'])
def delete_inventory_item(item_id):
    item = Inventory.query.get(item_id)
    if not item:
        return jsonify({'error': 'Inventory item not found'}), 404

    # Check if linked to any service requests
    if item.service_requests:
        return jsonify({'error': 'Cannot delete: inventory is linked to service requests'}), 400

    db.session.delete(item)
    db.session.commit()
    return jsonify({'message': 'Inventory item deleted successfully'}), 200


@inventory_bp.route('/inventories/<int:item_id>/restock', methods=['PATCH'])
def restock_inventory(item_id):
    item = Inventory.query.get(item_id)
    if not item:
        return jsonify({'error': 'Inventory item not found'}), 404

    data = request.get_json()
    quantity = data.get('quantity')

    if not isinstance(quantity, int) or quantity <= 0:
        return jsonify({'error': 'Amount must be a positive integer'}), 400

    item.quantity += quantity
    db.session.commit()
    return jsonify({
        'id': item.id,
        'name': item.name,
        'quantity': item.quantity,
        'price': item.price
    }), 200
