import json
import os
from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)

# Config
app.config["JWT_SECRET_KEY"] = "12345"
jwt = JWTManager(app)

# Archivos para la DB
TASK_FILE = 'task.json'
USERS_FILE = 'users.json'


# Leer y guardar en JSON
def leer_data(archivo):
    if not os.path.exists(archivo):
        return []
    try:
        with open(archivo, 'r') as f:
            return json.load(f)
    except:
        return []

def guardar_data(archivo, datos):
    with open(archivo, 'w') as f:
        json.dump(datos, f, indent=4)


# Autenticacion
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    users = leer_data(USERS_FILE)

    password_hash = generate_password_hash(data['pass'])

    nuevo_usuario = {
        "user": data['user'],
        "pass": password_hash
    }

    users.append(nuevo_usuario)
    guardar_data(USERS_FILE, users)

    return jsonify({
        "message": "Usuario registrado exitosamente"
    }), 201


# Iniciar sesion
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    users = leer_data(USERS_FILE)

    user = next((u for u in users if u['user'] == data['user']), None)

    # Verificar contraseña
    if user and check_password_hash(user['pass'], data['pass']):
        # Crear Token
        token = create_access_token(identity=user['user'])
        return jsonify(
            access_token=token
        ), 200

    return jsonify({
        "message": "Usuario/Contraseña incorrect@"
    }), 401


# CRUD
@app.route('/tareas', methods=['GET'])
@jwt_required()
def mostrar_tareas():
    task = leer_data(TASK_FILE)
    return jsonify(task), 200


@app.route('/tareas', methods=['POST'])
@jwt_required()
def agregar_tarea():
    data = request.get_json()
    task = leer_data(TASK_FILE)

    new_task = {
        "id": len(task) + 1,
        "titulo": data.get('titulo'),
        "completada": False
    }

    task.append(new_task)
    guardar_data(TASK_FILE, task)

    return jsonify({
        "message": "Nueva tarea", "tarea": new_task
    }), 201


@app.route('/tareas/<int:id>', methods=['PUT'])
@jwt_required()
def actualizar_tarea(id):
    data = request.get_json()
    tasks = leer_data(TASK_FILE)

    task = next((t for t in tasks if t['id'] == id), None)

    if task:
        task['titulo'] = data.get('titulo', task['titulo'])
        task['completada'] = data.get('completada', task['completada'])

        guardar_data(TASK_FILE, tasks)
        return jsonify({
            "message": "Tarea actualizada", "tarea": task
        }), 200

    return jsonify({
        "message": "Tarea no encontrada"
    }), 404


@app.route('/tareas/<int:id>', methods=['DELETE'])
@jwt_required()
def borrar_tarea(id):
    task = leer_data(TASK_FILE)

    filt_task = [t for t in task if t['id'] != id]

    if len(task) != len(filt_task):
        guardar_data(TASK_FILE, filt_task)
        return jsonify({
            "message": "Tarea eliminada"
        }), 200

    return jsonify({
        "message": "Tarea no encontrada"
    }), 404


if __name__ == '__main__':
    app.run(debug=True)