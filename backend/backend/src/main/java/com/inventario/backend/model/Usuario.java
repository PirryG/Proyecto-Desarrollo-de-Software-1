package com.inventario.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idUsuario;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false, unique = true)
    private String cedula;

    @Column(nullable = false, unique = true)
    private String correo;

    // 👇 Cambiado para permitir lectura desde el JSON pero ocultarlo en las respuestas
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private String contrasena;

    @Column(nullable = false)
    private String rol; // Ej: "ADMIN", "INVENTARIO", "USUARIO"

    @Column(nullable = false)
    private boolean activo = true;
}
