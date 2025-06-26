from flask import Flask, request,jsonify
from models import db, Admin, User, Mechanic, ServiceRequest,Inventory,Customer,Vehicle,ServiceRequestInventory
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from extensions import mail, jwt
import os
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app= Flask(__name__)
app.config['DEBUG'] = True

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'postgresql://postgres:password@localhost:5432/mobile_garage')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = '6130b704af74a32576e0747fb30a6cde444705dbc18033870d4fd8670f18ea10'



migrate = Migrate(app, db)
db.init_app(app)
bcrypt = Bcrypt(app)
# jwt = JWTManager(app)
CORS(app, origins="*", supports_credentials=True)


# mail configurations

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config["MAIL_USE_SSL"] = False

app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')

app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_USERNAME')


mail.init_app(app)
jwt.init_app(app)



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


