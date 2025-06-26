from flask import Blueprint, request, jsonify
from models import Admin, db, User,ServiceRequest,Mechanic
import re
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import bcrypt 
from datetime import datetime

admin_bp = Blueprint("admin_bp", __name__)


@admin_bp.route('/admins', methods=['GET'])
@jwt_required()
def get_admins():
    identity = get_jwt_identity()
    if identity['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403

    admins = Admin.query.all()
    if not admins:
        return jsonify({'message': 'No admins found'}), 404
    return jsonify([admin.to_dict() for admin in admins]), 200


@admin_bp.route('/admins/<int:admin_id>', methods=['GET'])
@jwt_required()
def get_admin_by_id(admin_id):
    identity = get_jwt_identity()
    if identity['role'] != 'admin' or identity['id'] != admin_id:
        return jsonify({'error': 'Unauthorized access'}), 403

    admin = Admin.query.filter_by(id=admin_id).first()
    if not admin:
        return jsonify({'error': 'Admin not found'}), 404
    return jsonify(admin.to_dict()), 200


@admin_bp.route('/admins/<int:admin_id>', methods=['PUT'])
@jwt_required()
def update_admin(admin_id):
    identity = get_jwt_identity()

    admin = Admin.query.filter_by(id=admin_id).first()
    if not admin:
        return jsonify({'error': 'Admin not found'}), 404

    print('lkjhgfghj', admin, admin.__dict__)
    # Optional: only allow that specific admin or a super admin to edit
    if identity['role'] != 'admin' :
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    print('data-0-0-0-0-', data)
    updated = False

    # ✅ Update Admin fields
    if 'name' in data:
        print('errorororoorhehehe1', data)
        name = data.get('name', '').strip()
        print('name details------', name)
        if not name:
            print('-2-2-2-2-2-2-22-2-2-', name)
            return jsonify({'error': 'Name cannot be empty'}), 400


        admin.name = name
        updated = True

    if 'phone_number' in data:

        phone = data.get('phone_number', '').strip()
        print('pppppppppp', phone)
        if not re.match(r'^\+?\d{10,15}$', phone):
            print('eerrr2')
            return jsonify({'error': 'Invalid phone number format'}), 400
        existing = Admin.query.filter_by(phone_number=phone).first()

        print('existing------', existing)
        if existing and existing.id != admin.id:
            print('errrr3')
            return jsonify({'error': 'Phone number already in use'}), 400
        admin.phone_number = phone
        updated = True

    
    user = admin.users[0]  # access related user

    if 'email' in data:
        email = data['email'].strip()
        if not email or '@' not in email:
            print('emailllllll', email)
            return jsonify({'error': 'Invalid email'}), 400
        # Make sure no other user has the same email
        existing_user = User.query.filter_by(email=email).first()
        if existing_user and existing_user.id != user.id:
            print('exemailss', existing_user)
            return jsonify({'error': 'Email already taken'}), 400
        user.email = email
        updated = True

    if 'role' in data:
        role = data['role'].strip().lower()
        if role not in ['admin']:
            print('rollellelel', role)
            return jsonify({'error': 'Invalid role'}), 400
        user.role = role
        updated = True


    if 'password' in data:
        hashed_pw = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        user.password = hashed_pw
        updated = True


    if not updated:
        return jsonify({'error': 'No valid fields to update'}), 400

    db.session.commit()
    return jsonify(admin.to_dict()), 200


@admin_bp.route('/admins/<int:admin_id>', methods=['DELETE'])
@jwt_required()
def delete_admin(admin_id):
    identity = get_jwt_identity()
    if identity['role'] != 'admin' :
        return jsonify({'error': 'Unauthorized access'}), 403

    admin = Admin.query.filter_by(id=admin_id).first()
    if not admin:
        return jsonify({'error': 'Admin not found'}), 404

    db.session.delete(admin)
    db.session.commit()
    return jsonify({'message': 'Admin deleted successfully'}), 200


@admin_bp.route('/admins', methods=['POST'])
@jwt_required()
def create_admin():
    identity = get_jwt_identity()
    if identity['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    print('daaata', data)

    user_data = data.get("users", [{}])[0]
    email = user_data.get("email")
    password = user_data.get("password")
    role = user_data.get("role", "Admin")

    if not all([email, password, data.get("name"), data.get("phone_number")]):
        return jsonify({"error": "Missing required fields"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 400

    admin = Admin(name=data["name"], phone_number=data["phone_number"])
    db.session.add(admin)
    db.session.commit()

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    user = User(email=email, password=hashed_password, role=role, admin_id=admin.id)
    db.session.add(user)
    db.session.commit()

    return jsonify(admin.to_dict()), 201



@admin_bp.route('/dashboard-stats')
@jwt_required()
def dashboard_stats():
    total_requests = ServiceRequest.query.count()
    active_requests = ServiceRequest.query.filter_by(status='Pending').count()
    total_mechanics = Mechanic.query.count()

    today = datetime.utcnow().date()
    today_appointments = ServiceRequest.query.filter(
        db.func.date(ServiceRequest.requested_at) == today
    ).count()

    return jsonify({
        'total_requests': total_requests,
        'active_requests': active_requests,
        'total_mechanics': total_mechanics,
        'today_appointments': today_appointments,
    })


# GET /admin/users/{user_id} - Get admin user details
@admin_bp.route('/admin/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_admin_user(user_id):
    identity = get_jwt_identity()
    print(identity)
    if identity['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    print(user_id)
    # uuser data - adminid
    user=User.query.filter_by(id=user_id).first()
    print(user.__dict__)
    admin = Admin.query.filter_by(id=user.admin_id).first()
    print('aaaadmin',admin)
    if not admin:
        print('aaaadmin',admin)
        return jsonify({'error': 'Admin not found'}), 404
    
    return jsonify({
        'id': admin.id,
        'name': admin.name,
        'email': admin.users[0].email if admin.users else None,
        'role': 'admin'
    }), 200

