from flask import Blueprint, request, jsonify
from models import ServiceRequest, Customer, db, Vehicle, User, Mechanic
from datetime import datetime
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask import current_app
from flask_mail import Message
from sqlalchemy import func


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
        'customer_id': req.customer_id,
        'vehicle_details': {
            'make': req.vehicle.make if req.vehicle else None,
            'model': req.vehicle.model if req.vehicle else None,
            'year_of_manufacture': req.vehicle.year_of_manufacture if req.vehicle else None,
        } if req.vehicle else None
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
        # Extract and normalize vehicle details
        make = data['vehicle_details'].get('make', '').strip().lower()
        model = data['vehicle_details'].get('model', '').strip().lower()
        year = int(data['vehicle_details'].get('year_of_manufacture', 0))

        # Check if vehicle already exists
        existing_vehicle = Vehicle.query.filter(
            func.lower(Vehicle.make) == make,
            func.lower(Vehicle.model) == model,
            Vehicle.year_of_manufacture == year,
            Vehicle.customer_id == user.customer_id
        ).first()

        if existing_vehicle:
            vehicle_id = existing_vehicle.id
        else:
            # Create new vehicle if it doesn't exist
            new_vehicle = Vehicle(
                make=make.title(),  # Store in title case (e.g., "Toyota")
                model=model.title(),
                year_of_manufacture=year,
                customer_id=user.customer_id
            )
            db.session.add(new_vehicle)
            db.session.commit()
            vehicle_id = new_vehicle.id

        # Create the service request
        new_req = ServiceRequest(
            issue=data['issue'].strip(),
            location=data['location'].strip(),
            vehicle_id=vehicle_id,
            customer_id=user.customer_id
        )
        db.session.add(new_req)
        db.session.commit()

        return jsonify(service_request_to_dict(new_req)), 201

    except ValueError:
        return jsonify({'error': 'Invalid year format'}), 400
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

    print(identity['role'])

    if identity['role'] == 'admin':
        allowed_fields = ['mechanic_id', 'status']
    elif identity['role'] == 'customer':
        if not user or not user.customer_id or req.customer_id != user.customer_id:
            return jsonify({'error': 'Unauthorized to update this request'}), 403
        allowed_fields = ['issue', 'location', 'vehicle_id', 'requested_at', 'completed_at']
    else:
        return jsonify({'error': 'Unauthorized access'}), 403

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

   
    unauthorized_fields = [key for key in data if key not in allowed_fields]
    if unauthorized_fields:
        return jsonify({
            'error': 'Unauthorized to update the following fields:',
            'fields': unauthorized_fields
        }), 403

    try:
        mechanic_assigned = False
        email_needs_sending = False

        for key in data:
            if key == 'mechanic_id':
                mechanic = Mechanic.query.get(data['mechanic_id'])
                if not mechanic:
                    return jsonify({'error': 'Invalid mechanic_id'}), 400
                req.mechanic_id = data['mechanic_id']
                mechanic_assigned = True
                email_needs_sending = True

            elif key == 'status':
                req.status = data['status']
                if req.status.lower() == 'completed' and not req.completed_at:
                    req.completed_at = datetime.utcnow()
                email_needs_sending = True

            elif key == 'issue':
                req.issue = data['issue'].strip()
                email_needs_sending = True

            elif key == 'location':
                req.location = data['location'].strip()
                email_needs_sending = True

            elif key == 'vehicle_id':
                req.vehicle_id = data['vehicle_id']
                email_needs_sending = True

            elif key == 'requested_at':
                req.requested_at = datetime.fromisoformat(data['requested_at'])
                email_needs_sending = True

            elif key == 'completed_at':
                req.completed_at = datetime.fromisoformat(data['completed_at'])
                email_needs_sending = True

        db.session.commit()

        print(email_needs_sending)
        # Send email
        if email_needs_sending:
            try:
                customer_user = req.customer.users[0]
                customer_email = customer_user.email
                customer_name = req.customer.name

                msg = Message(subject="Service Request Update", recipients=[customer_email])

                if identity['role'] == 'admin':
                    if mechanic_assigned:
                        msg.body = f"""
Hello {customer_name},

A mechanic has been assigned to your service request (ID: {req.id}).

Assigned Mechanic:
Name: {mechanic.name}
Phone Number: {mechanic.phone_number}
Location: {mechanic.location}

Thank you,
Mobile Garage Team
"""
                    elif 'status' in data:
                        msg.body = f"""
Hello {customer_name},

The status of your service request (ID: {req.id}) has been updated to "{req.status}".

Thank you,
Mobile Garage Team
"""

                elif identity['role'] == 'customer':
                    msg.body = f"""
Hello {customer_name},

You have successfully updated your service request (ID: {req.id}).

Updated Details:
Issue: {req.issue}
Location: {req.location}

Thank you,
Mobile Garage Team
"""

                if msg:
                    current_app.extensions['mail'].send(msg)

            except Exception as e:
                print(f"Email send error: {str(e)}")

        return jsonify(service_request_to_dict(req)), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update: {str(e)}'}), 500
