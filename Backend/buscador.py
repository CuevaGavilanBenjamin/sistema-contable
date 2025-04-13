from Diccionarios import cuentas_contables

def buscar_cuentas(query):
    query = query.lower()
    resultados = []

    for categoria in cuentas_contables.values():
        for codigo, (descripcion, _) in categoria.items():
            if query in str(codigo) or query in descripcion.lower():
                resultados.append({
                    "codigo": codigo,
                    "descripcion": descripcion
                })

    return resultados