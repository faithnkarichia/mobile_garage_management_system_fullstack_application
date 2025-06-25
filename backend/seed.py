from app import app  # Assuming you have your app instance in app.py
from models import db, Customer, Vehicle, Admin, Mechanic, User, ServiceRequest, Inventory, ServiceRequestInventory
from datetime import datetime, timezone

with app.app_context():
    # Wipe database
    db.drop_all()
    db.create_all()

    # Seed customers
    cust1 = Customer(
        name="John Doe", phone_number="0712345678", location="Nairobi")
    cust2 = Customer(name="Jane Smith",
                     phone_number="0798765432", location="Mombasa")

    db.session.add_all([cust1, cust2])
    db.session.commit()

    # Seed vehicles
    vehicle1 = Vehicle(make="Toyota", model="Corolla",
                       year_of_manufacture=2015, customer_id=cust1.id)
    vehicle2 = Vehicle(make="Honda", model="Civic",
                       year_of_manufacture=2018, customer_id=cust2.id)

    db.session.add_all([vehicle1, vehicle2])
    db.session.commit()

    # Seed admins
    admin1 = Admin(name="Alice Admin", phone_number="0700111222")
    db.session.add(admin1)
    db.session.commit()

    # Seed mechanics
    mech1 = Mechanic(
        name="Bob Mechanic",
        specialty="Engine Repair",
        location="Nairobi",
        phone_number="0700333444",
        email="bob@example.com",
        experience_years=5,
        status="Available",
        rating=4.5
    )
    mech2 = Mechanic(
        name="Charlie Mechanic",
        specialty="Brake Systems",
        location="Mombasa",
        phone_number="0700555666",
        email="charlie@example.com",
        experience_years=3,
        status="Available",
        rating=4.2
    )

    db.session.add_all([mech1, mech2])
    db.session.commit()

    # Seed users
    user1 = User(email="john@example.com", password="password123",
                 role="customer", customer_id=cust1.id)
    user2 = User(email="jane@example.com", password="password123",
                 role="customer", customer_id=cust2.id)
    user3 = User(email="alice@example.com", password="adminpass",
                 role="admin", admin_id=admin1.id)
    user4 = User(email="bob@example.com", password="mechpass",
                 role="mechanic", mechanic_id=mech1.id)
    user5 = User(email="charlie@example.com", password="mechpass",
                 role="mechanic", mechanic_id=mech2.id)

    db.session.add_all([user1, user2, user3, user4, user5])
    db.session.commit()

    # Seed inventory
    inv1 = Inventory(name="Brake Pad", quantity=50, price=1500.00)
    inv2 = Inventory(name="Oil Filter", quantity=100, price=800.00)

    db.session.add_all([inv1, inv2])
    db.session.commit()

    # Seed service requests
    req1 = ServiceRequest(
        issue="Engine overheating",
        status="Pending",
        location="Nairobi",
        requested_at=datetime.now(timezone.utc),
        customer_id=cust1.id,
        vehicle_id=vehicle1.id,
        mechanic_id=mech1.id
    )

    req2 = ServiceRequest(
        issue="Brake failure",
        status="Pending",
        location="Mombasa",
        requested_at=datetime.now(timezone.utc),
        customer_id=cust2.id,
        vehicle_id=vehicle2.id,
        mechanic_id=mech2.id
    )

    db.session.add_all([req1, req2])
    db.session.commit()

    # Link inventories to service requests
    link1 = ServiceRequestInventory(
        service_request_id=req1.id, inventory_id=inv2.id, used_quantity=2)
    link2 = ServiceRequestInventory(
        service_request_id=req2.id, inventory_id=inv1.id, used_quantity=1)

    db.session.add_all([link1, link2])
    db.session.commit()

    print("✅ Database seeded successfully!")
