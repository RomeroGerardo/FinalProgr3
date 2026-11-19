// BackEnd/__tests__/password.test.js
// S6: las contraseñas se guardan hasheadas con scrypt + salt aleatorio.
const { hashear, verificar } = require("../utils/password");

describe("utils/password", () => {
  test("hashear devuelve un string con formato scrypt$salt$hash", () => {
    const hash = hashear("alu123");

    expect(typeof hash).toBe("string");
    expect(hash.startsWith("scrypt$")).toBe(true);
    expect(hash.split("$")).toHaveLength(3);
  });

  test("hashear nunca devuelve la contraseña en texto plano", () => {
    const hash = hashear("alu123");

    expect(hash).not.toContain("alu123");
  });

  test("dos hashes de la misma contraseña son distintos (salt aleatorio)", () => {
    expect(hashear("alu123")).not.toBe(hashear("alu123"));
  });

  test("verificar acepta la contraseña correcta", () => {
    const hash = hashear("secreta-123");

    expect(verificar("secreta-123", hash)).toBe(true);
  });

  test("verificar rechaza una contraseña incorrecta", () => {
    const hash = hashear("secreta-123");

    expect(verificar("secreta-124", hash)).toBe(false);
    expect(verificar("", hash)).toBe(false);
  });

  test("verificar devuelve false si el hash es nulo o está corrupto", () => {
    expect(verificar("x", null)).toBe(false);
    expect(verificar("x", undefined)).toBe(false);
    expect(verificar("x", "")).toBe(false);
    expect(verificar("x", "no-es-un-hash")).toBe(false);
    expect(verificar("x", "scrypt$solounaParte")).toBe(false);
  });
});
