from flask_sqlalchemy import SQLAlchemy
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime

db = SQLAlchemy()

class Customer(db.Model, SerializerMixin):
    __tablename__ = 'customers'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone_number = db.Column(db.String(15), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    vehicles = db.relationship('Vehicle', backref='customer', lazy=True)
    service_requests = db.relationship('ServiceRequest', backref='customer', lazy=True)
    users = db.relationship('User', backref='customer', lazy=True)

    serialize_rules = (
        '-vehicles.customer',
        '-service_requests.customer',
        '-users.customer',
    )



class Vehicle(db.Model, SerializerMixin):
    __tablename__ = 'vehicles'

    id = db.Column(db.Integer, primary_key=True)
    make = db.Column(db.String(50), nullable=False)
    model = db.Column(db.String(50), nullable=False)
    year_of_manufacture = db.Column(db.Integer, nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    service_requests = db.relationship('ServiceRequest', backref='vehicle', lazy=True)

    serialize_rules=('-service_requests.vehicle', '-customer.vehicles')


class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'customer', 'admin', 'mechanic'
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=True)
    admin_id = db.Column(db.Integer, db.ForeignKey('admins.id'), nullable=True)
    mechanic_id = db.Column(db.Integer, db.ForeignKey('mechanics.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    serialize_rules=('-mechanic.users', '-admin.users', '-customer.users')

class Admin(db.Model, SerializerMixin):
    __tablename__ = 'admins'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone_number = db.Column(db.String(15), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    users = db.relationship('User', backref='admin', lazy=True)

    serialize_rules = ('-users.admin',)


class Mechanic(db.Model, SerializerMixin):
    __tablename__ = 'mechanics'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    speciality = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    phone_number = db.Column(db.String(15), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    service_requests = db.relationship('ServiceRequest', backref='mechanic', lazy=True)
    users = db.relationship('User', backref='mechanic', lazy=True)

    serialize_rules = ('-service_requests.mechanic', '-users.mechanic',)


class ServiceRequest(db.Model, SerializerMixin):
    __tablename__ = 'service_requests'

    id = db.Column(db.Integer, primary_key=True)
    issue = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(50), nullable=False, default='Pending')
    location = db.Column(db.String(100), nullable=False)
    requested_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.id'), nullable=False)
    mechanic_id = db.Column(db.Integer, db.ForeignKey('mechanics.id'), nullable=True)

    inventories = db.relationship('ServiceRequestInventory', backref='service_request', lazy=True)

    serialize_rules = ('-customer.service_requests', '-vehicle.service_requests', '-mechanic.service_requests', '-inventories.service_request',)


class Inventory(db.Model, SerializerMixin):
    __tablename__ = 'inventory'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    service_requests = db.relationship('ServiceRequestInventory', backref='inventory', lazy=True)

    serialize_rules = ('-service_requests.inventory',)


class ServiceRequestInventory(db.Model, SerializerMixin):
    __tablename__ = 'service_request_inventory'

    id = db.Column(db.Integer, primary_key=True)
    service_request_id = db.Column(db.Integer, db.ForeignKey('service_requests.id'), nullable=False)
    inventory_id = db.Column(db.Integer, db.ForeignKey('inventory.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


    serialize_rules = ('-service_request.inventories', '-inventory.service_requests')
