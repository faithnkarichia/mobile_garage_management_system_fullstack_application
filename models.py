from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Metadata
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime


metadata=Metadata()

db=SQLAlchemy(metadata=metadata)


class Customer(db.Model, SerializerMixin):
    __tablename__ = 'customers'


class Vehicle(db.Model, SerializerMixin):
    __tablename__ = 'vehicles'



class User(db.Model, SerializerMixin):
    __tablename__ = 'users'



class Admin(db.Model, SerializerMixin):
    __tablename__ = 'admins'



class Mechanic(db.Model, SerializerMixin):
    __tablename__ = 'mechanics'



class ServiceRequest(db.Model, SerializerMixin):
    __tablename__ = 'service_requests'



class Inventory(db.Model, SerializerMixin):
    __tablename__ = 'inventory'


class ServiceRequestInventory(db.Model, SerializerMixin):
    __tablename__ = 'service_request_inventory'



