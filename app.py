from flask import Flask, jsonify, request
from flask_migrate import Migrate
from db import db
from models.book import Book   

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:postgres@localhost:5432/book'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
migrate = Migrate(app, db)

@app.route('/books', methods=['POST'])
def add_book():
    data = request.get_json()    
    newBook = Book(title=data['title'], author = data['author'], description= data['description'])
    db.session.add(newBook)
    db.session.commit()
    return jsonify ({'message': 'livro inserido com sucesso'}), 201

@app.route('/books', methods=['GET'])
def get_all():
    books = Book.query.all()
    return jsonify([book.as_dict() for book in books])

@app.route('/books/<uuid:book_id>', methods=['GET'])
def get_book(book_id):
    book = Book.query.get_or_404(book_id)
    return jsonify(book.as_dict())

@app.route('/books/<uuid:book_id>', methods=['PATCH'])
def update_book(book_id):
    book = Book.query.get_or_404(book_id)
    data = request.get_json()

    for key, value in data.items():
        setattr(book, key, value)

    db.session.commit()
    return jsonify({'message': 'Livro atualizado com sucesso'})

@app.route('/books/<uuid:book_id>', methods=['DELETE'])
def delete(book_id):
    book = Book.query.get_or_404(book_id)
    db.session.delete(book)
    db.session.commit()
    return jsonify({'message': 'Livro removido do com sucesso'})

if __name__ == '__main__':
    app.run(debug= True, port=8080, host='0.0.0.0') 