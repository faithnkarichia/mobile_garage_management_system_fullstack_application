from flask import Blueprint, request, jsonify
from models import User, db, Customer, Admin, Mechanic
import re
from app import bcrypt
from app import app
from datetime import datetime, timedelta
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token,get_jwt
from flask_mail import Message
from extensions import mail
from flask import current_app
from flask_mail import Message

user_bp = Blueprint("user_bp", __name__)




def user_to_dict(user):
    return {
        'id': user.id,
        'email': user.email,
        'role': user.role,
        'customer_id': user.customer_id,
        'admin_id': user.admin_id,
        'mechanic_id': user.mechanic_id
    }


@user_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    identity = get_jwt_identity()
    if identity['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403
    users = User.query.all()
    if not users:
        return jsonify({'message': 'No users found'}), 404
    return jsonify([user_to_dict(u) for u in users]), 200


@user_bp.route('/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_by_id(user_id):
    identity = get_jwt_identity()
    if identity['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(user_to_dict(user)), 200





@user_bp.route('/signup', methods=['POST'])
def customer_signup():
    data = request.get_json()

    
    required_fields = ['name', 'phone_number', 'location', 'email', 'password']
    if not data or not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

   
    email = data['email'].strip().lower()
    if not re.fullmatch(r'^[^@]+@[^@]+\.[^@]+$', email):
        return jsonify({'error': 'Invalid email format'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 409

    
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')

    
    new_customer = Customer(
        name=data['name'],
        phone_number=data['phone_number'],
        location=data['location']
    )
    db.session.add(new_customer)
    db.session.flush()  

    
    new_user = User(
        email=email,
        password=hashed_password,
        role='customer',
        customer_id=new_customer.id
    )
    db.session.add(new_user)
    db.session.commit()

    msg = Message(
    "Welcome to Mobile Garage!",
    recipients=[new_user.email]  # send to the newly registered user's email
)

    msg.body = (
    f"Hello {new_customer.name},\n\n"
    f"Your account has been successfully created!\n\n"
    f"Email: {new_user.email}\n"
    f"Role: {new_user.role}\n\n"
    f"Thank you for registering with Mobile Garage Services.\n"
)

    current_app.extensions['mail'].send(msg)


    return jsonify({'message': 'Account created successfully. Please log in.'}), 201



@user_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    identity = get_jwt_identity()
    if identity['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    if 'email' in data:
        email = data['email'].strip().lower()
        if not re.fullmatch(r'^[^@]+@[^@]+\.[^@]+$', email):
            return jsonify({'error': 'Invalid email format'}), 400
        if User.query.filter(User.email == email, User.id != user.id).first():
            return jsonify({'error': 'Email already in use'}), 409
        user.email = email

    if 'password' in data:
        plaintext_password = data['password']
        hashed_password = bcrypt.generate_password_hash(
            plaintext_password).decode('utf-8')
        user.password = hashed_password

    if 'role' in data:
        if data['role'] not in ['customer', 'admin', 'mechanic']:
            return jsonify({'error': 'Invalid role'}), 400
        user.role = data['role']

    if 'customer_id' in data:
        user.customer_id = data['customer_id']

    if 'admin_id' in data:
        user.admin_id = data['admin_id']

    if 'mechanic_id' in data:
        user.mechanic_id = data['mechanic_id']

    db.session.commit()
    return jsonify(user_to_dict(user)), 200


@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    identity = get_jwt_identity()
    if identity['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Delete linked Customer, Mechanic, Admin if they exist
    if user.customer:
        db.session.delete(user.customer)
    if user.mechanic:
        db.session.delete(user.mechanic)
    if user.admin:
        db.session.delete(user.admin)

    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User and related records deleted successfully'}), 200


@user_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Email and password required'}), 400

    email = data['email'].strip().lower()
    password = data['password']

    user = User.query.filter_by(email=email).first()
    print(f'uuuuseeerrr: {user}')
    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({'error': 'Invalid email or password'}), 401

    # Create JWT
    print(f'Creating access token for user: {user.customer_id}')
    access_token = create_access_token(
       
        identity={'id': user.id, 'role': user.role, 'customer_id': user.customer_id },
        expires_delta=timedelta(hours=24)
    )

    return jsonify({'access_token': access_token}), 200




# from flask_jwt_extended import 
from extensions import blacklist  

@user_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    jti = get_jwt()['jti']  # JWT unique identifier
    blacklist.add(jti)
    return jsonify({'message': 'Successfully logged out'}), 200

@user_bp.route('/user/me', methods=['GET'])
@jwt_required()
def get_current_user():
    identity = get_jwt_identity()
    user = User.query.get(identity['id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get related data based on role
    data = {
        'id': user.id,
        'email': user.email,
        'role': user.role,
        'created_at': user.created_at.isoformat()
    }
    
    if user.role == 'customer' and user.customer:
        data['name'] = user.customer.name
    elif user.role == 'mechanic' and user.mechanic:
        data['name'] = user.mechanic.name
    elif user.role == 'admin' and user.admin:
        data['name'] = user.admin.name
    
    return jsonify(data), 200





@user_bp.route('/contact', methods=['POST'])
def send_contact_email():
    data = request.json
    
    
    if not all([data.get('name'), data.get('email'), data.get('message')]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    try:
        # Create email message
        msg = Message(
            subject=f"New Contact Form Submission from {data['name']}",
            recipients=["faynkarichia@gmail.com"],  
            sender=app.config['MAIL_DEFAULT_SENDER']
        )
        
        # Email body
        msg.body = f"""
        New contact form submission:
        
        Name: {data['name']}
        Email: {data['email']}
        Phone: {data.get('phone', 'Not provided')}
        
        Message:
        {data['message']}
        """
        
        
        msg.html = f"""
        <h3>New contact form submission:</h3>
        <p><strong>Name:</strong> {data['name']}</p>
        <p><strong>Email:</strong> {data['email']}</p>
        <p><strong>Phone:</strong> {data.get('phone', 'Not provided')}</p>
        <p><strong>Message:</strong></p>
        <p>{data['message']}</p>
        """
        
        
        mail.send(msg)
        
        return jsonify({'message': 'Email sent successfully'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
