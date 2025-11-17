package com.inventario.backend.controller;

import com.inventario.backend.model.Usuario;
import com.inventario.backend.service.UsuarioService;
import com.inventario.backend.utils.ValidadorDatos;
import com.inventario.backend.repository.UsuarioRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private UsuarioService usuarioService;

    //  Registrar un nuevo usuario
    @PostMapping("/registrar")
    public ResponseEntity<?> registrarUsuario(@RequestBody Usuario usuario) {
        try {
            // Validar datos antes de guardar
            ValidadorDatos.validarUsuario(usuario);

            // Verificar si ya existe cédula o correo
            if (usuarioRepository.findByCedula(usuario.getCedula()).isPresent()) {
                return ResponseEntity.status(400).body("La cédula ya está registrada.");
            }
            if (usuarioRepository.findByCorreo(usuario.getCorreo()).isPresent()) {
                return ResponseEntity.status(400).body("El correo ya está registrado.");
            }

            //  Encriptar contraseña antes de guardar
            BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
            usuario.setContrasena(passwordEncoder.encode(usuario.getContrasena()));

            // Guardar usuario
            usuarioRepository.save(usuario);
            usuario.setContrasena(null); // No devolver la contraseña
            return ResponseEntity.ok(usuario);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error al registrar el usuario.");
        }
    }

    //  Actualizar datos del usuario
    @PutMapping("/{idUsuario}")
    public Usuario actualizar(@PathVariable Long idUsuario, @RequestBody Usuario usuario) {
        return usuarioService.actualizarPerfil(idUsuario, usuario);
    }

    //  Listar todos los usuarios
    @GetMapping
    public List<Usuario> listarUsuarios() {
        return usuarioService.obtenerTodos();
    }

    //  Obtener un usuario por su ID
    @GetMapping("/{idUsuario}")
    public ResponseEntity<Usuario> obtenerUsuarioPorId(@PathVariable Long idUsuario) {
        Optional<Usuario> usuario = usuarioService.obtenerPorId(idUsuario);
        return usuario.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    //  Cambiar el estado del usuario
    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstadoUsuario(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {

        boolean activo = body.get("activo");
        Optional<Usuario> optionalUsuario = usuarioRepository.findById(id);

        if (optionalUsuario.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Usuario no encontrado");
        }

        Usuario usuario = optionalUsuario.get();
        usuario.setActivo(activo);
        usuarioRepository.save(usuario);

        return ResponseEntity.ok(usuario);
    }

    // Login de usuario (por cédula y contraseña)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credenciales) {
        try {
            String cedula = credenciales.get("cedula");
            String contrasena = credenciales.get("contrasena");

            Optional<Usuario> usuarioOpt = usuarioService.login(cedula, contrasena);

            if (usuarioOpt.isPresent()) {
                Usuario usuario = usuarioOpt.get();
                usuario.setContrasena(null); // 🔒 No enviar la contraseña
                return ResponseEntity.ok(usuario);
            } else {
                return ResponseEntity.status(401).body("Credenciales inválidas");
            }

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error interno del servidor");
        }
    }
}
