// Helpers de validación de entrada compartidos por los controllers.

const esTextoValido = (valor) => typeof valor === "string" && valor.trim() !== ""

const esEmailValido = (valor) => esTextoValido(valor) && valor.includes("@")

// Acepta 3 o "3", pero rechaza 0, negativos, decimales y NaN.
const esIdPositivo = (valor) => {
    const numero = Number(valor)
    return Number.isInteger(numero) && numero > 0
}

// Devuelve el id como número, o null si no es un entero positivo.
const parsearId = (valor) => (esIdPositivo(valor) ? Number(valor) : null)

module.exports = { esTextoValido, esEmailValido, esIdPositivo, parsearId }
