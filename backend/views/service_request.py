from flask import Blueprint, request, jsonify
from models import ServiceRequest, Customer, db, Vehicle, User, Mechanic
from datetime import datetime
from flask_jwt_extended import jwt_required, get_jwt_identity

service_request_bp = Blueprint("service_request_bp", __name__)



def service_request_to_dict(req):
    return {
        'id': req.id,
        'issue': req.issue,
        'location': req.location,
        'status': req.status,
        'requested_at': req.requested_at.isoformat() if req.requested_at else None,
        'completed_at': req.completed_at.isoformat() if req.completed_at else None,
        'vehicle_id': req.vehicle_id,
        'mechanic_id': req.mechanic_id,
        'customer_id': req.customer_id
    }


def get_current_user():
    identity = get_jwt_identity()
    return User.query.get(identity['id'])


# get_service_requests
@service_request_bp.route('/service_requests', methods=['GET'])
@jwt_required()
def get_service_requests():
    identity = get_jwt_identity()

    print(f"User identity: {identity}")
    user = get_current_user()

    if identity['role'] == 'admin':
        requests = ServiceRequest.query.all()
    elif identity['role'] == 'customer':
        if not user or not user.customer_id:
            return jsonify({'error': 'Customer not found'}), 404
        requests = ServiceRequest.query.filter_by(customer_id=user.customer_id).all()
    
    elif identity['role'] == 'mechanic':
        requests = ServiceRequest.query.filter_by(mechanic_id=user.mechanic_id).all()
    else:
        return jsonify({'error': 'Unauthorized access'}), 403

    if not requests:
        return jsonify({'message': 'No service requests found'}), 404

    return jsonify([service_request_to_dict(r) for r in requests]), 200


#get_service_request_by_id
@service_request_bp.route('/service_requests/<int:request_id>', methods=['GET'])
@jwt_required()
def get_service_request_by_id(request_id):
    identity = get_jwt_identity()
    user = get_current_user()
    req = ServiceRequest.query.get(request_id)

    if not req:
        return jsonify({'error': 'Service request not found'}), 404

   
    if identity['role'] == 'admin':
        pass
    
    elif identity['role'] == 'customer':
        if not user or not user.customer_id or req.customer_id != user.customer_id:
            return jsonify({'error': 'Unauthorized access'}), 403
    else:
        return jsonify({'error': 'Unauthorized access'}), 403

    return jsonify(service_request_to_dict(req)), 200


# create_service_request
@service_request_bp.route('/service_requests', methods=['POST'])
@jwt_required()
def create_service_request():
    identity = get_jwt_identity()
    user = get_current_user()

    if identity['role'] != 'customer':
        return jsonify({'error': 'Unauthorized access'}), 403

    if not user or not user.customer_id:
        return jsonify({'error': 'Customer not found'}), 404

    data = request.get_json()
    required_fields = ['issue', 'location', 'vehicle_details']
    if not data or not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        
        vehicle = Vehicle(
            make=data['vehicle_details'].get('make', '').strip(),
            model=data['vehicle_details'].get('model', '').strip(),
            year_of_manufacture=int(data['vehicle_details'].get('year_of_manufacture', 0)),
            customer_id=user.customer_id
        )
        db.session.add(vehicle)
        db.session.commit()

        
        new_req = ServiceRequest(
            issue=data['issue'].strip(),
            location=data['location'].strip(),
            vehicle_id=vehicle.id,
            customer_id=user.customer_id
        )
        db.session.add(new_req)
        db.session.commit()
        return jsonify(service_request_to_dict(new_req)), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500


# update_service_request
@service_request_bp.route('/service_requests/<int:request_id>', methods=['PUT'])
@jwt_required()
def update_service_request(request_id):
    identity = get_jwt_identity()
    user = get_current_user()
    req = ServiceRequest.query.get(request_id)

    if not req:
        return jsonify({'error': 'Service request not found'}), 404

    
    if identity['role'] == 'admin':
        pass
    elif identity['role'] == 'customer':
        if not user or not user.customer_id or req.customer_id != user.customer_id:
            return jsonify({'error': 'Unauthorized to update this request'}), 403
    else:
        return jsonify({'error': 'Unauthorized access'}), 403

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    try:
        if 'issue' in data:
            req.issue = data['issue'].strip()
        if 'location' in data:
            req.location = data['location'].strip()
        if 'status' in data:
            req.status = data['status']
            if req.status.lower() == 'completed' and not req.completed_at:
                req.completed_at = datetime.utcnow()
        if 'vehicle_id' in data:
            req.vehicle_id = data['vehicle_id']
        if 'mechanic_id' in data:
            mechanic = Mechanic.query.get(data['mechanic_id'])
            if not mechanic:
                return jsonify({'error': 'Invalid mechanic_id'}), 400
            req.mechanic_id = data['mechanic_id']
        if 'requested_at' in data:
            req.requested_at = datetime.fromisoformat(data['requested_at'])
        if 'completed_at' in data:
            req.completed_at = datetime.fromisoformat(data['completed_at'])

        db.session.commit()
        return jsonify(service_request_to_dict(req)), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update: {str(e)}'}), 500
