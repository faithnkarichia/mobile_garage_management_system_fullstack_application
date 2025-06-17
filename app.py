from flask import Flask, request,jsonify
from models import db, Admin, User, Mechanic, ServiceRequest,Inventory,Customer,Vehicle,ServiceRequestInventory
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
import os


app= Flask(__name__)
app.config['DEBUG'] = True

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = '6130b704af74a32576e0747fb30a6cde444705dbc18033870d4fd8670f18ea10'



migrate = Migrate(app, db)
db.init_app(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)





from views import *


app.register_blueprint(user_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(mechanic_bp)
app.register_blueprint(service_request_bp)
app.register_blueprint(inventory_bp)
app.register_blueprint(service_request_inventory_bp)
app.register_blueprint(customer_bp)
app.register_blueprint(vehicle_bp)




if __name__== '__main__':
    app.run(debug=True, use_reloader=True, reloader_type='poll')


