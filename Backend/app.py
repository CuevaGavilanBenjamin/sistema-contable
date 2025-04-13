from Diccionarios import cuentas_contables, categorias
from flask import Flask, request, jsonify
from buscador import buscar_cuentas
from flask_cors import CORS
from reporte import generar_estado_resultado, generar_reporte_situacion_financiera, calcular_saldos_por_cuenta  # Importar las funciones necesarias

app = Flask(__name__)
CORS(app)

asientos = []  # Aquí se guardarán los registros

@app.route('/api/operaciones', methods=['GET'])
def get_operaciones():
    return jsonify(asientos)

@app.route('/api/operaciones', methods=['POST'])
def registrar_operacion():
    try:
        data = request.json

        # Verificar que los datos estén en el formato correcto
        if not data or 'movimientos' not in data or 'fecha' not in data:
            return jsonify({"error": "Faltan campos requeridos (fecha o movimientos)."}), 400

        operacion = []
        for movimiento in data['movimientos']:
            tipo = movimiento['tipo']
            codigo = movimiento['codigo']
            monto = movimiento['monto']

            # Validar tipo
            if tipo not in ['D', 'H']:
                return jsonify({"error": "Tipo inválido. Debe ser 'D' o 'H'."}), 400

            # Buscar cuenta
            cuenta_encontrada = None
            for categoria_id, cuentas in cuentas_contables.items():
                if codigo in cuentas:
                    nombre, _ = cuentas[codigo]
                    cuenta_encontrada = (codigo, nombre, categoria_id)
                    break

            if not cuenta_encontrada:
                return jsonify({"error": f"Código de cuenta {codigo} no encontrado."}), 400

            # Validar monto
            if monto <= 0:
                return jsonify({"error": "El monto debe ser un valor positivo."}), 400

            # Agregar movimiento a la operación
            operacion.append({
                "codigo": cuenta_encontrada[0],
                "descripcion": cuenta_encontrada[1],
                "tipo": tipo,
                "monto": monto
            })

        # Agregar operación con fecha
        asientos.append({
            "fecha": data['fecha'],
            "movimientos": operacion
        })

        return jsonify({"message": "Operación registrada con éxito"}), 201

    except Exception as e:
        return jsonify({"error": f"Error interno: {str(e)}"}), 500

@app.route('/buscar-cuenta', methods=['GET'])
def buscar_cuenta():
    query = request.args.get('q', '')
    resultados = buscar_cuentas(query)
    return jsonify(resultados)

@app.route('/api/reporte-saldos', methods=['GET'])
def reporte_saldos():
    try:
        saldos = calcular_saldos_por_cuenta(asientos)
        return jsonify({"reporte_saldos": saldos})
    except Exception as e:
        return jsonify({"error": f"No se pudo generar el reporte: {str(e)}"}), 500

@app.route('/api/estado-financiero', methods=['GET'])
def estado_financiero():
    try:
        reporte= generar_reporte_situacion_financiera(asientos)
        return jsonify({"estado_financiero": reporte})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
if __name__ == '__main__':
    app.run(debug=True)

@app.route('/api/operaciones/limpiar-ultima', methods=['DELETE'])
def limpiar_ultima_operacion():
    try:
        if not asientos:
            return jsonify({"error": "No hay operaciones para eliminar."}), 400
        
        # Eliminar la última operación
        asientos.pop()
        
        return jsonify({"message": "Última operación eliminada con éxito."}), 200
    except Exception as e:
        return jsonify({"error": f"Se borro correctamente"}), 500

@app.route('/api/operaciones/limpiar-todo', methods=['DELETE'])
def limpiar_todas_operaciones():
    try:
        # Limpiar todas las operaciones
        asientos.clear()
        
        return jsonify({"message": "Todas las operaciones han sido eliminadas con éxito."}), 200
    except Exception as e:
        return jsonify({"error": f"Error al eliminar todas las operaciones: {str(e)}"}), 500

@app.route("/api/estado-resultados")
def estado_resultado():
    resultado = generar_estado_resultado(asientos)
    return jsonify(resultado)

if __name__ == "__main__":
    app.run(debug=True)