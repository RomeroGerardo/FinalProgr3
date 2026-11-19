// Hash de contraseñas con scrypt (nativo de Node, sin dependencias externas).
// Formato almacenado: scrypt$<saltHex>$<hashHex>
const crypto = require("node:crypto")

const KEY_LENGTH = 64
const PREFIJO = "scrypt"

const hashear = (password) => {
    const salt = crypto.randomBytes(16).toString("hex")
    const derivada = crypto.scryptSync(String(password), salt, KEY_LENGTH)
    return `${PREFIJO}$${salt}$${derivada.toString("hex")}`
}

// Nunca lanza: cualquier hash ausente o corrupto se considera inválido.
const verificar = (password, hash) => {
    if (typeof hash !== "string" || !hash.startsWith(`${PREFIJO}$`)) return false

    const partes = hash.split("$")
    if (partes.length !== 3) return false

    const [, salt, esperado] = partes
    if (!salt || !esperado) return false

    try {
        const derivada = crypto.scryptSync(String(password), salt, KEY_LENGTH)
        const esperadoBuf = Buffer.from(esperado, "hex")
        // Longitudes distintas hacen que timingSafeEqual lance: se rechaza antes.
        if (esperadoBuf.length !== derivada.length) return false
        return crypto.timingSafeEqual(derivada, esperadoBuf)
    } catch {
        return false
    }
}

module.exports = { hashear, verificar }
