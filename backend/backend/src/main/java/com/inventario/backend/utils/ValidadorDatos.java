package com.inventario.backend.utils;

import com.inventario.backend.model.Usuario;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class ValidadorDatos {

    private static final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // 🔹 Validar credenciales en login
    public static void validarCredenciales(Usuario usuario, String contrasenaIngresada) {
        if (usuario == null) {
            throw new IllegalArgumentException("El usuario no existe.");
        }

        if (contrasenaIngresada == null || contrasenaIngresada.isEmpty()) {
            throw new IllegalArgumentException("La contraseña no puede estar vacía.");
        }

        // 🔹 Validar coincidencia de contraseña (encriptada)
        if (!passwordEncoder.matches(contrasenaIngresada, usuario.getContrasena())) {
            throw new IllegalArgumentException("Contraseña incorrecta.");
        }
    }

    // 🔹 Validar datos del usuario al registrar o actualizar
    public static void validarUsuario(Usuario usuario) {
        if (usuario == null) {
            throw new IllegalArgumentException("El usuario no puede ser nulo.");
        }

        if (usuario.getNombre() == null || usuario.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre no puede estar vacío.");
        }

        if (usuario.getCedula() == null || !usuario.getCedula().matches("\\d{6,10}")) {
            throw new IllegalArgumentException("La cédula debe contener entre 6 y 10 dígitos numéricos.");
        }

        if (usuario.getCorreo() == null || 
            !usuario.getCorreo().matches("^[\\w-.]+@[\\w-]+\\.[a-zA-Z]{2,}$")) {
            throw new IllegalArgumentException("El correo electrónico no es válido.");
        }

        if (usuario.getContrasena() == null || usuario.getContrasena().length() < 6) {
            throw new IllegalArgumentException("La contraseña debe tener al menos 6 caracteres.");
        }

        if (usuario.getRol() == null || usuario.getRol().trim().isEmpty()) {
            throw new IllegalArgumentException("El rol es obligatorio.");
        }

        String rol = usuario.getRol().toUpperCase();
        if (!rol.equals("ADMIN") && !rol.equals("USER")) {
            throw new IllegalArgumentException("El rol debe ser ADMIN o USER.");
        }
    }
}
