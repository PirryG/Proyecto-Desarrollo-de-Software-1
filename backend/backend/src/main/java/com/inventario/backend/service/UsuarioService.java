package com.inventario.backend.service;

import com.inventario.backend.utils.ValidadorDatos;
import com.inventario.backend.model.Usuario;
import com.inventario.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // 🔹 Registrar usuario
    public Usuario registrarUsuario(Usuario usuario) {
        if (usuario.getContrasena() == null || usuario.getContrasena().isEmpty()) {
            throw new IllegalArgumentException("La contraseña no puede ser nula o vacía");
        }
        usuario.setContrasena(passwordEncoder.encode(usuario.getContrasena()));
        return usuarioRepository.save(usuario);
    }

    // 🔹 Iniciar sesión
    public Optional<Usuario> login(String cedula, String contrasena) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByCedula(cedula);

        if (usuarioOpt.isEmpty()) {
            throw new IllegalArgumentException("Cédula no encontrada.");
        }

        Usuario usuario = usuarioOpt.get();

        // 🚫 Verificar si está inactivo
     if (!usuario.isActivo()) {
    throw new IllegalArgumentException("El usuario está desactivado. Contacta al administrador.");
}



        // ✅ Validar contraseña
        ValidadorDatos.validarCredenciales(usuario, contrasena);

        return Optional.of(usuario);
    }

    // 🔹 Editar perfil
    public Usuario actualizarPerfil(Long idUsuario, Usuario nuevosDatos) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 🔸 Si se envía una nueva contraseña, validar todo
        if (nuevosDatos.getContrasena() != null && !nuevosDatos.getContrasena().isEmpty()) {
            ValidadorDatos.validarUsuario(nuevosDatos);
            usuario.setContrasena(passwordEncoder.encode(nuevosDatos.getContrasena()));
        } else {
            // Validar los demás campos, pero ignorar la contraseña
            if (nuevosDatos.getNombre() == null || nuevosDatos.getNombre().trim().isEmpty()) {
                throw new IllegalArgumentException("El nombre no puede estar vacío.");
            }

            if (nuevosDatos.getCedula() == null || !nuevosDatos.getCedula().matches("\\d{6,10}")) {
                throw new IllegalArgumentException("La cédula debe contener entre 6 y 10 dígitos numéricos.");
            }

            if (nuevosDatos.getCorreo() == null ||
                    !nuevosDatos.getCorreo().matches("^[\\w-.]+@[\\w-]+\\.[a-zA-Z]{2,}$")) {
                throw new IllegalArgumentException("El correo electrónico no es válido.");
            }

            if (nuevosDatos.getRol() == null || nuevosDatos.getRol().trim().isEmpty()) {
                throw new IllegalArgumentException("El rol es obligatorio.");
            }

            String rol = nuevosDatos.getRol().toUpperCase();
            if (!rol.equals("ADMIN") && !rol.equals("USER")) {
                throw new IllegalArgumentException("El rol debe ser ADMIN o USER.");
            }
        }

        usuario.setNombre(nuevosDatos.getNombre());
        usuario.setCorreo(nuevosDatos.getCorreo());
        usuario.setRol(nuevosDatos.getRol());
        usuario.setCedula(nuevosDatos.getCedula());

        return usuarioRepository.save(usuario);
    }

    // 🔹 Obtener todos los usuarios
    public List<Usuario> obtenerTodos() {
        return usuarioRepository.findAll();
    }

    // 🔹 Obtener usuario por id
    public Optional<Usuario> obtenerPorId(Long idUsuario) {
        return usuarioRepository.findById(idUsuario);
    }

    // Cambiar estado del usuario
public Usuario cambiarEstadoUsuario(Long idUsuario, boolean activo) {
    Usuario usuario = usuarioRepository.findById(idUsuario)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

    usuario.setActivo(activo);
    return usuarioRepository.save(usuario);
}

}
