from flask import Blueprint, request, jsonify
from models import Inventory, db
from flask_jwt_extended import jwt_required, get_jwt_identity

inventory_bp = Blueprint("inventory_bp", __name__)

# GET all inventory items


@inventory_bp.route('/inventories', methods=['GET'])
@jwt_required()
def get_inventories():
    identity = get_jwt_identity()
    print(f"User identity: {identity}")
    if identity['role'] not in ['admin', 'mechanic']:
        print(f"Unauthorized access attempt by user: {identity['role']}")
        return jsonify({'error': 'Unauthorized access'}), 403

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
            'threshold': item.threshold,
            'created_at': item.created_at.strftime('%Y-%m-%d %H:%M:%S')
        })

    return jsonify(inventory_list), 200

# GET single inventory item


@inventory_bp.route('/inventories/<int:item_id>', methods=['GET'])
@jwt_required()
def get_inventory_item(item_id):
    identity = get_jwt_identity()
    if identity['role'] not in ['admin', 'mechanic']:
        return jsonify({'error': 'Unauthorized access'}), 403
    item = Inventory.query.filter_by(id=item_id).first()
    if not item:
        return jsonify({'error': 'Inventory item not found'}), 404

    item_data = {
        'id': item.id,
        'name': item.name,
        'quantity': item.quantity,
        'price': item.price,
        'threshold': item.threshold,
        'created_at': item.created_at.strftime('%Y-%m-%d %H:%M:%S')
    }

    return jsonify(item_data), 200

# CREATE inventory item


@inventory_bp.route('/inventories', methods=['POST'])
@jwt_required()
def create_inventory_item():
    identity = get_jwt_identity()
    if identity['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403

    data = request.get_json()

    inventory_data = data.get('inventory')
    if not inventory_data:
        return jsonify({'error': 'Missing "inventory" data'}), 400

    if not all(field in inventory_data for field in ['name', 'quantity', 'price']):
        return jsonify({'error': 'Missing required fields'}), 400

    name = inventory_data['name'].strip()
    quantity = inventory_data['quantity']
    price = inventory_data['price']
    threshold = inventory_data.get('threshold', 5)

    if not name:
        return jsonify({'error': 'Name cannot be empty'}), 400
    if not isinstance(quantity, int) or quantity < 0:
        return jsonify({'error': 'Quantity must be a non-negative integer'}), 400
    if not isinstance(price, (int, float)) or price < 0:
        return jsonify({'error': 'Price must be a non-negative number'}), 400
    if not isinstance(threshold, int) or threshold < 0:
        return jsonify({'error': 'Threshold must be a non-negative integer'}), 400

    new_item = Inventory(name=name, quantity=quantity,
                         price=price, threshold=threshold)
    db.session.add(new_item)
    db.session.commit()

    item_data = {
        'id': new_item.id,
        'name': new_item.name,
        'quantity': new_item.quantity,
        'price': new_item.price,
        'threshold': new_item.threshold,
        'created_at': new_item.created_at.strftime('%Y-%m-%d %H:%M:%S')
    }

    return jsonify(item_data), 201

# UPDATE inventory item

@inventory_bp.route('/inventories/<int:item_id>', methods=['PUT'])
@jwt_required()
def update_inventory_item(item_id):
    identity = get_jwt_identity()
    if identity['role'] not in ['admin', 'mechanic']:
        return jsonify({'error': 'Unauthorized access'}), 403

    item = Inventory.query.get(item_id)
    if not item:
        return jsonify({'error': 'Inventory item not found'}), 404

    data = request.get_json()
    print(f"Data received for update: {data}")
    
    inventory_data = data.get('inventory')
    if not inventory_data:
        return jsonify({'error': 'No inventory data provided'}), 400

    if 'name' in inventory_data:
        name = inventory_data['name'].strip()
        print(f"Name to update: {name}")
        if not name:
            return jsonify({'error': 'Name cannot be empty'}), 400
        item.name = name

    if 'quantity' in inventory_data:
        quantity = inventory_data['quantity']
        if not isinstance(quantity, int) or quantity < 0:
            return jsonify({'error': 'Quantity must be a non-negative integer'}), 400
        item.quantity = quantity

    if 'price' in inventory_data:
        price = inventory_data['price']
        if not isinstance(price, (int, float)) or price < 0:
            return jsonify({'error': 'Price must be a non-negative number'}), 400
        item.price = price

    if 'threshold' in inventory_data:
        threshold = inventory_data['threshold']
        if not isinstance(threshold, int) or threshold < 0:
            return jsonify({'error': 'Threshold must be a non-negative integer'}), 400
        item.threshold = threshold

    db.session.commit()

    item_data = {
        'id': item.id,
        'name': item.name,
        'quantity': item.quantity,
        'price': item.price,
        'threshold': item.threshold,
        'created_at': item.created_at.strftime('%Y-%m-%d %H:%M:%S')
    }

    return jsonify(item_data), 200


@inventory_bp.route('/inventories/<int:item_id>', methods=['DELETE'])
@jwt_required()
def delete_inventory_item(item_id):
    identity = get_jwt_identity()
    if identity['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403
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
@jwt_required()
def restock_inventory(item_id):
    identity = get_jwt_identity()
    if identity['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403
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
        'price': item.price,
        'threshold': item.threshold,
    }), 200


@inventory_bp.route('/inventories/<int:item_id>/reduce', methods=['PATCH'])
@jwt_required()
def reduce_inventory(item_id):
    identity = get_jwt_identity()
    if identity['role'] not in ['admin', 'mechanic']:
        return jsonify({'error': 'Unauthorized access'}), 403
    item = Inventory.query.get(item_id)
    if not item:
        return jsonify({'error': 'Inventory item not found'}), 404

    data = request.get_json()
    quantity = data.get('quantity')

    if not isinstance(quantity, int) or quantity <= 0:
        return jsonify({'error': 'Amount must be a positive integer'}), 400

    if item.quantity < quantity:
        return jsonify({'error': 'Insufficient inventory quantity'}), 400

    item.quantity -= quantity
    db.session.commit()
    return jsonify({
        'id': item.id,
        'name': item.name,
        'quantity': item.quantity,
        'price': item.price,
        'threshold': item.threshold,
    }), 200
