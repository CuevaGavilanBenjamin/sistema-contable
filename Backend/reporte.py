def calcular_saldos_por_cuenta(asientos):
    saldos = {}

    for asiento in asientos:
        for movimiento in asiento['movimientos']:
            codigo = movimiento['codigo']
            codigo = str(movimiento['codigo'])  # ← Aquí la magia

            descripcion = movimiento['descripcion']
            tipo = movimiento['tipo']
            monto = movimiento['monto']

            if codigo not in saldos:
                saldos[codigo] = {
                    "descripcion": descripcion,
                    "debe": 0.0,
                    "haber": 0.0,
                    "saldo": 0.0
                }

            if tipo == 'D':
                saldos[codigo]["debe"] += monto
            elif tipo == 'H':
                saldos[codigo]["haber"] += monto

            saldos[codigo]["saldo"] = abs(saldos[codigo]["debe"] - saldos[codigo]["haber"])
    print("Saldos calculados:", saldos)
    return saldos


def generar_reporte_situacion_financiera(asientos):
    saldos = calcular_saldos_por_cuenta(asientos)

    reporte = {
        "Estado de Situación Financiera": {
            "Activo": {
                "Corriente": {
                    "Caja": 0,
                    "Cuentas por Cobrar": 0,
                    "Inventario": 0,
                    "Servicios Anticipados": 0,
                    "Total Corriente": 0
                },
                "No Corriente": {
                    "Activo Fijo": 0,
                    "Depreciacion Acumulada": 0,
                    "Activo Diferido": 0,
                    "Total No Corriente": 0
                },
                "Total Activo": 0
            },
            "Pasivo": {
                "Corriente": {
                    "Remuneraciones por Pagar": 0,
                    "Cuentas por Pagar": 0,
                    "Otros Pasivos": 0,
                    "Total Corriente": 0
                },
                "No Corriente": {
                    "Pasivos a Largo Plazo": 0,
                    "Total No Corriente": 0
                },
                "Total Pasivo": 0
            },
            "Patrimonio": {
                "Capital Social": 0,
                "Utilidades Acumuladas": 0,
                "Total Patrimonio": 0
            },
            "Totales": {
                "Activo Total": 0,
                "Pasivo + Patrimonio": 0
            }
        }
    }

    # === ACTIVO ===

    # Corriente
    codigos_caja = ["10", "11"]
    codigos_cxc = ["12", "13", "14", "16", "17"]
    codigos_inventario = ["20", "21", "22", "23", "24", "25", "26", "28"]
    codigos_servicios = ["18"]

    # Asignamos los saldos para cada cuenta, sumando solo las cuentas presentes en el JSON
    reporte["Estado de Situación Financiera"]["Activo"]["Corriente"]["Caja"] = sum(
        saldos.get(c, {"saldo": 0})["saldo"] for c in codigos_caja
    )
    reporte["Estado de Situación Financiera"]["Activo"]["Corriente"]["Cuentas por Cobrar"] = sum(
        saldos.get(c, {"saldo": 0})["saldo"] for c in codigos_cxc
    )
    reporte["Estado de Situación Financiera"]["Activo"]["Corriente"]["Inventario"] = sum(
        saldos.get(c, {"saldo": 0})["saldo"] for c in codigos_inventario
    )
    reporte["Estado de Situación Financiera"]["Activo"]["Corriente"]["Servicios Anticipados"] = sum(
        saldos.get(c, {"saldo": 0})["saldo"] for c in codigos_servicios
    )

    total_corriente = sum(
        value for key, value in reporte["Estado de Situación Financiera"]["Activo"]["Corriente"].items()
        if key != "Total Corriente"
    )
    reporte["Estado de Situación Financiera"]["Activo"]["Corriente"]["Total Corriente"] = total_corriente

    # No Corriente
    codigos_activo_fijo = ["27", "30", "31", "32", "33", "34", "35"]
    codigos_depreciacion = ["29", "36", "39"]
    codigos_diferido = ["37"]

    activo_fijo = sum(saldos.get(c, {"saldo": 0})["saldo"] for c in codigos_activo_fijo)
    depreciacion = sum(saldos.get(c, {"saldo": 0})["saldo"] for c in codigos_depreciacion)
    activo_diferido = sum(saldos.get(c, {"saldo": 0})["saldo"] for c in codigos_diferido)

    reporte["Estado de Situación Financiera"]["Activo"]["No Corriente"]["Activo Fijo"] = activo_fijo
    reporte["Estado de Situación Financiera"]["Activo"]["No Corriente"]["Depreciacion Acumulada"] = depreciacion
    reporte["Estado de Situación Financiera"]["Activo"]["No Corriente"]["Activo Diferido"] = activo_diferido

    total_no_corriente = activo_fijo - depreciacion - activo_diferido
    reporte["Estado de Situación Financiera"]["Activo"]["No Corriente"]["Total No Corriente"] = total_no_corriente

    reporte["Estado de Situación Financiera"]["Activo"]["Total Activo"] = total_corriente + total_no_corriente

    # =========== PASIVO ==========
    reporte["Estado de Situación Financiera"]["Pasivo"] = {
        "Corriente": {},
        "No Corriente": {}
    }

    # Pasivo Corriente
    codigos_remuneraciones = ["40", "41"]
    codigos_cuentas_por_pagar = ["42", "43", "44", "45", "46", "47"]

    remuneraciones = sum(saldos.get(c, {"saldo": 0})["saldo"] for c in codigos_remuneraciones)
    cuentas_por_pagar = sum(saldos.get(c, {"saldo": 0})["saldo"] for c in codigos_cuentas_por_pagar)

    reporte["Estado de Situación Financiera"]["Pasivo"]["Corriente"]["Remuneraciones por Pagar"] = remuneraciones
    reporte["Estado de Situación Financiera"]["Pasivo"]["Corriente"]["Cuentas por Pagar"] = cuentas_por_pagar
    total_pasivo_corriente = remuneraciones + cuentas_por_pagar
    reporte["Estado de Situación Financiera"]["Pasivo"]["Corriente"]["Total Corriente"] = total_pasivo_corriente

    # Pasivo No Corriente
    codigos_pasivo_no_corriente = ["48", "49"]
    total_pasivo_no_corriente = sum(saldos.get(c, {"saldo": 0})["saldo"] for c in codigos_pasivo_no_corriente)
    reporte["Estado de Situación Financiera"]["Pasivo"]["No Corriente"]["Total No Corriente"] = total_pasivo_no_corriente

    # Total Pasivo
    total_pasivo = total_pasivo_corriente + total_pasivo_no_corriente
    reporte["Estado de Situación Financiera"]["Pasivo"]["Total Pasivo"] = total_pasivo

    # ================= PATRIMONIO =========
    reporte["Estado de Situación Financiera"]["Patrimonio"] = {}

    codigos_capital = ["50", "51", "52"]
    # codigos_utilidades = ["56", "57", "58"]  # Ya no se usará

    capital_social = sum(saldos.get(c, {"saldo": 0})["saldo"] for c in codigos_capital)

    # Obtenemos el resultado del estado de resultados
    estado_resultado = generar_estado_resultado(asientos)

    utilidades_acumuladas = estado_resultado.get("Estado de Resultados", {}).get("Utilidad Antes de Impuestos", 0)


    reporte["Estado de Situación Financiera"]["Patrimonio"]["Capital Social"] = capital_social
    reporte["Estado de Situación Financiera"]["Patrimonio"]["Utilidades Acumuladas"] = utilidades_acumuladas
    total_patrimonio = capital_social + utilidades_acumuladas
    reporte["Estado de Situación Financiera"]["Patrimonio"]["Total Patrimonio"] = total_patrimonio

    # === TOTALES ===
    reporte["Estado de Situación Financiera"]["Totales"]["Activo Total"] = (
        reporte["Estado de Situación Financiera"]["Activo"]["Total Activo"]
    )
    reporte["Estado de Situación Financiera"]["Totales"]["Pasivo + Patrimonio"] = (
        total_pasivo + total_patrimonio
    )
    for codigo in saldos:
        print(f"Saldo para código {codigo}: {saldos[codigo]}")
    
    return reporte


def generar_estado_resultado(asientos):
    saldos = calcular_saldos_por_cuenta(asientos)

    # Extraemos los saldos de las cuentas necesarias
    cuenta = lambda c: saldos.get(str(c), {"saldo": 0})["saldo"]

    ventas = cuenta(70)
    costos_ventas = cuenta(69)
    utilidad_bruta = ventas - costos_ventas

    # Gastos operativos
    gastos_personal = cuenta(62)
    gastos_servicios = cuenta(63)
    valuacion_deterioro = cuenta(68)
    gastos_operativos = gastos_personal + gastos_servicios + valuacion_deterioro

    utilidad_operativa = utilidad_bruta - gastos_operativos

    otros_ingresos = cuenta(75)
    otros_gastos = cuenta(66)

    utilidad_antes_impuestos = utilidad_operativa + otros_ingresos - otros_gastos

    impuesto_renta = cuenta(88)
    utilidad_neta = utilidad_antes_impuestos - impuesto_renta

    return {
        "Estado de Resultados": {
            "Ventas (70)": ventas,
            "Costos de Ventas (69)": costos_ventas,
            "Utilidad Bruta": utilidad_bruta,
            "Gastos Operativos": {
                "62 - Gastos de Personal": gastos_personal,
                "63 - Servicios de Terceros": gastos_servicios,
                "68 - Valuación y Deterioro": valuacion_deterioro,
                "Total Gastos Operativos": gastos_operativos
            },
            "Utilidad Operativa": utilidad_operativa,
            "Otros Ingresos (75)": otros_ingresos,
            "Otros Gastos (66)": otros_gastos,
            "Utilidad Antes de Impuestos": utilidad_antes_impuestos,
            "Impuesto a la Renta (88)": impuesto_renta,
            "Utilidad Neta del Periodo": utilidad_neta
        }
    }

