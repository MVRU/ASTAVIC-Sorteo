// src/services/authenticationService.test.js
//! DECISIÓN DE DISEÑO: Estos casos verifican que la autenticación sea configurable y segura frente a errores.
import { buildAuthenticationServiceSafely, createAuthenticationService } from "./authenticationService";

describe("authenticationService", () => {
  it("acepta credenciales válidas usando un proveedor personalizado", async () => {
    const service = createAuthenticationService({
      credentialsProvider: () => ({
        adminEmail: "admin@astavic.test",
        adminPassword: "clave-secreta",
      }),
    });

    await expect(
      service.validateCredentials({
        email: "  admin@astavic.test  ",
        password: "clave-secreta",
      })
    ).resolves.toBe(true);
  });

  it("rechaza entradas incompletas", async () => {
    const service = createAuthenticationService({
      credentialsProvider: () => ({
        adminEmail: "admin@astavic.test",
        adminPassword: "clave-secreta",
      }),
    });

    await expect(
      service.validateCredentials({ email: "", password: "clave-secreta" })
    ).resolves.toBe(false);
  });

  it("informa errores de configuración y bloquea el login", async () => {
    const configurationError = new Error("config ausente");
    const { service, configurationError: capturedError } =
      buildAuthenticationServiceSafely({
        credentialsProvider: () => {
          throw configurationError;
        },
      });

    expect(capturedError).toBe(configurationError);
    await expect(
      service.validateCredentials({ email: "admin", password: "123" })
    ).rejects.toBe(configurationError);
  });
});
