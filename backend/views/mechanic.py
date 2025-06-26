from flask import Blueprint, request, jsonify
from models import Mechanic, db, ServiceRequest, User, Inventory, ServiceRequestInventory
import re
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import bcrypt

mechanic_bp = Blueprint("mechanic_bp", __name__)

# Utility function for safe dict


def mechanic_to_dict(mechanic):
    return {
        'id': mechanic.id,
        'name': mechanic.name,
        'specialty': mechanic.specialty,
        'location': mechanic.location,
        'phone_number': mechanic.phone_number,
        'status': mechanic.status,
        'email': mechanic.email,
        'experience_years': mechanic.experience_years,
        'rating': mechanic.rating,
        'created_at': mechanic.created_at.isoformat()
    }


@mechanic_bp.route('/mechanics', methods=['GET'])
@jwt_required()
def get_mechanics():
    identity = get_jwt_identity()
    # if identity['role'] not in ['admin', 'mechanic']:
    if identity['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403
    mechanics = Mechanic.query.all()
    if not mechanics:
        return jsonify({'message': 'No mechanics found'}), 404
    return jsonify([mechanic_to_dict(m) for m in mechanics]), 200


@mechanic_bp.route('/mechanics/<int:mechanic_id>', methods=['GET'])
@jwt_required()
def get_mechanic_by_id(mechanic_id):
    identity = get_jwt_identity()
    if identity['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403
    mechanic = Mechanic.query.get(mechanic_id)
    if not mechanic:
        return jsonify({'error': 'Mechanic not found'}), 404
    return jsonify(mechanic_to_dict(mechanic)), 200


@mechanic_bp.route('/mechanics', methods=['POST'])
@jwt_required()
def create_mechanic():
    identity = get_jwt_identity()
    if identity['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403

    try:
        data = request.get_json()

        # ✅ Required fields check
        required_fields = [
            'name', 'specialty', 'location',
            'phone_number', 'email', 'experience_years',
            'status', 'password'
        ]
        if not data or not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        # ✅ Clean & Validate phone number
        phone = data['phone_number'].strip()
        if not re.fullmatch(r'^\+?\d{10,15}$', phone):
            return jsonify({'error': 'Invalid phone number format'}), 400

        # ✅ Check if mechanic already exists by name/phone/email
        if Mechanic.query.filter_by(name=data['name'].strip()).first():
            return jsonify({'error': 'Mechanic with this name already exists'}), 409
        if Mechanic.query.filter_by(phone_number=phone).first():
            return jsonify({'error': 'Mechanic with this phone number already exists'}), 409
        if Mechanic.query.filter_by(email=data['email'].strip()).first():
            return jsonify({'error': 'Mechanic with this email already exists'}), 409

        # ✅ Email format validation
        if not re.fullmatch(r'^[\w\.-]+@[\w\.-]+\.\w+$', data['email'].strip()):
            return jsonify({'error': 'Invalid email format'}), 400

        # ✅ Experience years must be int ≥ 0
        if not isinstance(data['experience_years'], int) or data['experience_years'] < 0:
            return jsonify({'error': 'Experience years must be a non-negative integer'}), 400

        # ✅ Status validation
        status = data['status'].strip().title()
        if status not in ['Available', 'Unavailable']:
            return jsonify({'error': 'Status must be either Available or Unavailable'}), 400

        # ✅ Password validation
        password = data['password'].strip()
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters long'}), 400

        # ✅ Create Mechanic
        new_mechanic = Mechanic(
            name=data['name'].strip(),
            specialty=data['specialty'].strip(),
            location=data['location'].strip(),
            phone_number=phone,
            email=data['email'].strip(),
            experience_years=data['experience_years'],
            status=status,
            rating=data.get('rating', None),
        )
        db.session.add(new_mechanic)
        db.session.flush()  # ✅ Get new_mechanic.id without committing yet

        # ✅ Create related User account
        hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')

        new_user = User(
            email=data['email'].strip(),
            password=hashed_pw,
            role="mechanic",
            mechanic_id=new_mechanic.id,
        )
        db.session.add(new_user)

        db.session.commit()  # ✅ Commit both together

        return jsonify(mechanic_to_dict(new_mechanic)), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500


@mechanic_bp.route('/mechanics/<int:mechanic_id>', methods=['PUT'])
@jwt_required()
def update_mechanic(mechanic_id):
    identity = get_jwt_identity()
    if identity['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403
    mechanic = Mechanic.query.get(mechanic_id)
    if not mechanic:
        return jsonify({'error': 'Mechanic not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    updated = False

    if 'name' in data:
        name = data['name'].strip()
        if not name:
            return jsonify({'error': 'Name cannot be empty'}), 400
        mechanic.name = name
        updated = True

    if 'specialty' in data:
        specialty = data['specialty'].strip()
        if not specialty:
            return jsonify({'error': 'Specialty cannot be empty'}), 400
        mechanic.specialty = specialty
        updated = True

    if 'location' in data:
        location = data['location'].strip()
        if not location:
            return jsonify({'error': 'Location cannot be empty'}), 400
        mechanic.location = location
        updated = True

    if 'phone_number' in data:
        phone = data['phone_number'].strip()
        if not re.fullmatch(r'^\+?\d{10,15}$', phone):
            return jsonify({'error': 'Invalid phone number format'}), 400
        existing = Mechanic.query.filter_by(phone_number=phone).first()
        if existing and existing.id != mechanic.id:
            return jsonify({'error': 'Phone number already in use'}), 409
        mechanic.phone_number = phone
        updated = True

    if 'email' in data:
        email = data['email'].strip()
        if not re.fullmatch(r'^[\w\.-]+@[\w\.-]+\.\w+$', email):
            return jsonify({'error': 'Invalid email format'}), 400
        existing = Mechanic.query.filter_by(email=email).first()
        if existing and existing.id != mechanic.id:
            return jsonify({'error': 'Email already in use'}), 409
        mechanic.email = email
        updated = True
    if 'experience_years' in data:
        experience_years = data['experience_years']
        if not isinstance(experience_years, int) or experience_years < 0:
            return jsonify({'error': 'Experience years must be a non-negative integer'}), 400
        mechanic.experience_years = experience_years
        updated = True
    if 'status' in data:
        status = data['status'].strip()
        if status not in ['Available', 'Unavailable']:
            return jsonify({'error': 'Status must be either Available or Unavailable'}), 400
        mechanic.status = status
        updated = True
    if 'rating' in data:
        rating = data['rating']
        if rating is not None and (not isinstance(rating, (int, float)) or rating < 0 or rating > 5):
            return jsonify({'error': 'Rating must be a number between 0 and 5'}), 400
        mechanic.rating = rating
        updated = True

    if not updated:
        return jsonify({'error': 'No valid fields to update'}), 400

    db.session.commit()
    return jsonify(mechanic_to_dict(mechanic)), 200




@mechanic_bp.route('/mechanics/dashboard', methods=['GET'])
@jwt_required()
def mechanic_dashboard_data():
    identity = get_jwt_identity()
    print('kkkkkk', identity)
    # First verify the user is a mechanic
    if identity['role'] != 'mechanic':
        return jsonify({'error': 'Unauthorized access'}), 403

    # Get the user record to find the mechanic_id
    user = User.query.get(identity['id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Get the mechanic record using the mechanic_id from user
    mechanic = Mechanic.query.get(user.mechanic_id)
    if not mechanic:
        return jsonify({'error': 'Mechanic not found'}), 404

    # Get all service requests for this mechanic
    service_requests = ServiceRequest.query.filter_by(
        mechanic_id=mechanic.id).all()

    # Calculate basic stats
    total_tasks = len(service_requests)
    completed_tasks = len(
        [r for r in service_requests if r.status == 'Completed'])
    pending_tasks = len([r for r in service_requests if r.status == 'Pending'])
    in_progress_tasks = len(
        [r for r in service_requests if r.status == 'In Progress'])

    # Calculate hours worked
    total_hours = 0.0
    completed_requests = [r for r in service_requests if r.completed_at]
    for req in completed_requests:
        duration = req.completed_at - req.requested_at
        total_hours += round(duration.total_seconds() / 3600, 2)

    # Get recent tasks (last 5)
    recent_tasks = sorted(
        service_requests, key=lambda x: x.requested_at, reverse=True)[:5]

    # Calculate inventory used
    inventory_used = db.session.query(
        Inventory.name,
        db.func.sum(ServiceRequestInventory.used_quantity).label('total_used'))
    inventory_used = db.session.query(
        Inventory.name,
        db.func.sum(ServiceRequestInventory.used_quantity).label(
            'total_used')
    ).join(ServiceRequestInventory, Inventory.id == ServiceRequestInventory.inventory_id) \
     .join(ServiceRequest, ServiceRequestInventory.service_request_id == ServiceRequest.id) \
     .filter(ServiceRequest.mechanic_id == mechanic.id) \
     .group_by(Inventory.name) \
     .all()

    return jsonify({
        'mechanic_info': {
            'id': mechanic.id,
            'name': mechanic.name,
            'specialty': mechanic.specialty,
            'rating': mechanic.rating,
            'status': mechanic.status,
            'experience_years': mechanic.experience_years
        },
        'stats': {
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'pending_tasks': pending_tasks,
            'in_progress_tasks': in_progress_tasks,
            'hours_worked': total_hours,
            'completion_rate': round((completed_tasks / total_tasks * 100), 2) if total_tasks > 0 else 0
        },
        'recent_tasks': [{
            'id': task.id,
            'issue': task.issue,
            'status': task.status,
            'requested_at': task.requested_at.isoformat(),
            'vehicle': f"{task.vehicle.make} {task.vehicle.model}" if task.vehicle else 'N/A'
        } for task in recent_tasks],
        'inventory_used': [{
            'name': item.name,
            'total_used': item.total_used
        } for item in inventory_used]
    }), 200



# GET /mechanic/users/{user_id} - Get mechanic user details
@mechanic_bp.route('/mechanic/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_mechanic_user(user_id):
    identity = get_jwt_identity()
    if identity['role'] != 'mechanic':
        return jsonify({'error': 'Unauthorized'}), 403
    
    user = User.query.filter_by(id=user_id).first()
    mechanic = Mechanic.query.filter_by(id=user.mechanic_id).first()
    
    if not mechanic:
        return jsonify({'error': 'Mechanic not found'}), 404
    
    return jsonify({
        'id': mechanic.id,
        'name': mechanic.name,
        'email': user.email,
        'role': 'mechanic',
        'specialty': mechanic.specialty,
        'experience_years': mechanic.experience_years
    }), 200