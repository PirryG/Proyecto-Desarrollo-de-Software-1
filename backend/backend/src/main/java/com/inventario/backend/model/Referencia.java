package com.inventario.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "referencias")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Referencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idReferencia;

    @Column(nullable = false, unique = true)
    private String codigo;

    @Column(nullable = false, unique = true)
    private String nombre;

    @Column(nullable = false)
    private boolean activo = true;
}
