package com.inventario.backend.controller;

import com.inventario.backend.model.Usuario;
import com.inventario.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final UsuarioRepository usuarioRepository;

    // DTO para recibir las credenciales
    public static class LoginRequest {
        public String cedula;
        public String contrasena;
    }

    

    @PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest request) {
    Optional<Usuario> usuarioOpt = usuarioRepository.findByCedula(request.cedula);

    if (usuarioOpt.isEmpty()) {
        return ResponseEntity.status(401).body(Map.of("mensaje", "Cédula no encontrada"));
    }

    Usuario usuario = usuarioOpt.get();

    if (!usuario.getContrasena().equals(request.contrasena)) {
        return ResponseEntity.status(401).body(Map.of("mensaje", "Contraseña incorrecta"));
    }

    usuario.setContrasena(null);
    return ResponseEntity.ok(usuario);
}
}
