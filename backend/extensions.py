from flask_jwt_extended import JWTManager
from flask_mail import Mail

mail = Mail()
jwt = JWTManager()

blacklist = set()

@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload["jti"]
    return jti in blacklist