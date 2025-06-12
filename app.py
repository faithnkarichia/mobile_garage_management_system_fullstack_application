from flask import Flask, request,jsonify
from models import db, Admin, User, Mechanic, ServiceRequest,Inventory,Customer,Vehicle,ServiceRequestInventory
from flask_migrate import Migrate

app= Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False



migrate = Migrate(app, db)
db.init_app(app)



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
    app.run(debug=True)


