from session10 import create_app, db


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)