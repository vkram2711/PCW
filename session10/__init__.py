from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_restx import Api

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'secret-key-goes-here'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite'
    db.init_app(app)

    CORS(app)  # Enable CORS

    api = Api(app, doc='/docs')  # Initialize Api and set the documentation endpoint

    from .main import main as main_blueprint

    app.register_blueprint(main_blueprint)

    from .main import api as main_api
    api.add_namespace(main_api, path='/api')

    return app