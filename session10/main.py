from flask import Blueprint, request, jsonify
from flask_restx import Namespace, Resource, fields

from . import db
from .models import Board, Column, Task

main = Blueprint('main', __name__)
api = Namespace('main', description='Main operations')

# Define request and response models
board_model = api.model('Board', {
    'id': fields.Integer(readOnly=True, description='The unique identifier of a board'),
    'name': fields.String(required=True, description='Board name'),
    'user_id': fields.Integer(required=True, description='User ID')
})

column_model = api.model('Column', {
    'id': fields.Integer(readOnly=True, description='The unique identifier of a column'),
    'name': fields.String(required=True, description='Column name'),
    'board_id': fields.Integer(required=True, description='Board ID')
})

task_model = api.model('Task', {
    'id': fields.Integer(readOnly=True, description='The unique identifier of a task'),
    'title': fields.String(required=True, description='Task title'),
    'description': fields.String(description='Task description'),
    'column_id': fields.Integer(required=True, description='Column ID')
})


@api.route('/boards')
class BoardList(Resource):
    @api.doc('list_boards')
    @api.marshal_list_with(board_model)
    def get(self):
        """List all boards"""
        boards = Board.query.all()
        return boards

    @api.doc('create_board')
    @api.expect(board_model)
    def post(self):
        """Create a new board"""
        data = request.get_json()
        new_board = Board(name=data['name'], user_id=data['user_id'])
        db.session.add(new_board)
        db.session.commit()
        return {'message': 'Board created!'}, 201


@api.route('/boards/<int:board_id>/columns')
class ColumnList(Resource):
    @api.doc('list_columns')
    @api.marshal_list_with(column_model)
    def get(self, board_id):
        """List all columns for a given board"""
        columns = Column.query.filter_by(board_id=board_id).all()
        return columns

    @api.doc('create_column')
    @api.expect(column_model)
    def post(self, board_id):
        """Create a new column in a given board"""
        data = request.get_json()
        new_column = Column(name=data['name'], board_id=board_id)
        db.session.add(new_column)
        db.session.commit()
        return {'message': 'Column created!'}, 201


@api.route('/columns/<int:column_id>/tasks')
class TaskList(Resource):
    @api.doc('list_tasks')
    @api.marshal_list_with(task_model)
    def get(self, column_id):
        """List all tasks for a given column"""
        tasks = Task.query.filter_by(column_id=column_id).all()
        return tasks

    @api.doc('create_task')
    @api.expect(task_model)
    def post(self, column_id):
        """Create a new task in a given column"""
        data = request.get_json()
        new_task = Task(title=data['title'], description=data['description'], column_id=column_id)
        db.session.add(new_task)
        db.session.commit()
        return {'message': 'Task created!'}, 201