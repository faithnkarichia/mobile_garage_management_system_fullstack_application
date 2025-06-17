from flask import Blueprint, request, jsonify
from models import ServiceRequest, Customer, db, Vehicle, User,Mechanic
from datetime import datetime
from flask_jwt_extended import jwt_required, get_jwt_identity

service_request_bp = Blueprint("service_request_bp", __name__)

# Utility function to build dict manually


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


@service_request_bp.route('/service_requests', methods=['GET'])
@jwt_required()
def get_service_requests():

    identity = get_jwt_identity()
    if identity['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403
    requests = ServiceRequest.query.all()
    if not requests:
        return jsonify({'message': 'No service requests found'}), 404
    return jsonify([service_request_to_dict(r) for r in requests]), 200


@service_request_bp.route('/service_requests/<int:request_id>', methods=['GET'])
@jwt_required()
def get_service_request_by_id(request_id):
    identity = get_jwt_identity()
    if identity['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403
    req = ServiceRequest.query.get(request_id)
    if not req:
        return jsonify({'error': 'Service request not found'}), 404
    return jsonify(service_request_to_dict(req)), 200


@service_request_bp.route('/service_requests', methods=['POST'])
@jwt_required()
def create_service_request():
    identity = get_jwt_identity()
    
    if identity['role'] != 'customer':
        return jsonify({'error': 'Unauthorized access'}), 403
    data = request.get_json()
    required_fields = ['issue', 'location', 'vehicle_details']
    if not data or not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    user = User.query.filter_by(id=identity['id']).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404


    customer = User.query.filter_by(id=user.customer_id).first()
    if not customer:
            return jsonify({'error': 'Customer not found'}), 404
    
    # insert vehicle details
    vehicle = Vehicle(
        make=data['vehicle_details'].get('make', '').strip(),
        model=data['vehicle_details'].get('model', '').strip(),
        year_of_manufacture=data['vehicle_details'].get(
            'year_of_manufacture', '').strip(),
        customer_id=customer.id
    )
    db.session.add(vehicle)
    db.session.commit()

    try:
        new_req = ServiceRequest(
            issue=data['issue'].strip(),
            location=data['location'].strip(),
            vehicle_id=vehicle.id,
            
            customer_id=customer.id,
           
            completed_at=None
        )
        db.session.add(new_req)
        db.session.commit()
        return jsonify(service_request_to_dict(new_req)), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500


@service_request_bp.route('/service_requests/<int:request_id>', methods=['PUT'])
@jwt_required()
def update_service_request(request_id):
    identity = get_jwt_identity()
    if identity['role'] not in ['admin', 'customer']:
        return jsonify({'error': 'Unauthorized access'}), 403
    req = ServiceRequest.query.get(request_id)
    if not req:
        return jsonify({'error': 'Service request not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

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
        mechanic = Mechanic.query.filter_by(id=data['mechanic_id']).first()
        if not mechanic :
            return jsonify({'error': 'Invalid mechanic_id: mechanic not found'}), 400
        
        req.mechanic_id = data['mechanic_id']
    if 'customer_id' in data:
        req.customer_id = data['customer_id']
    if 'requested_at' in data:
        try:
            req.requested_at = datetime.fromisoformat(data['requested_at'])
        except:
            return jsonify({'error': 'Invalid requested_at format (use ISO format)'}), 400
    if 'completed_at' in data:
        try:
            req.completed_at = datetime.fromisoformat(data['completed_at'])
        except:
            return jsonify({'error': 'Invalid completed_at format (use ISO format)'}), 400

    db.session.commit()
    return jsonify(service_request_to_dict(req)), 200

# @service_request_bp.route('/service_requests/<int:request_id>', methods=['DELETE'])
# def delete_service_request(request_id):
#     req = ServiceRequest.query.get(request_id)
#     if not req:
#         return jsonify({'error': 'Service request not found'}), 404
#     db.session.delete(req)
#     db.session.commit()
#     return jsonify({'message': 'Service request deleted successfully'}), 200
