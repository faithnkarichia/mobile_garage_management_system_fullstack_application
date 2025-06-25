from app import app, db, bcrypt
from models import User

with app.app_context():
    users = User.query.all()
    for user in users:
        # Check if password looks unhashed (simple check: hashed passwords are long, plain ones aren't)
        if len(user.password) < 30:  # bcrypt hashes are typically > 60 chars
            print(f"Hashing password for user: {user.email}")
            hashed = bcrypt.generate_password_hash(user.password).decode('utf-8')
            user.password = hashed
        else:
            print(f"Password for {user.email} already hashed")
    
    db.session.commit()
    print("Done updating passwords!")
