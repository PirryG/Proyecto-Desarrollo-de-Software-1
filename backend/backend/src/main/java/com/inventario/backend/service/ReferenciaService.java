package com.inventario.backend.service;

import com.inventario.backend.model.Referencia;
import com.inventario.backend.repository.ReferenciaRepository;
import com.inventario.backend.utils.ValidadorDatos;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReferenciaService {

    @Autowired
    private ReferenciaRepository referenciaRepository;

    // ----------------------------------------------------
    // VALIDAR FORMATO DE CÓDIGO (RF + números)
    // ----------------------------------------------------
    private void validarCodigoRF(String codigo) {
        if (codigo == null || !codigo.matches("^RF\\d+$")) {
            throw new IllegalArgumentException(
                "El código debe iniciar con 'RF' seguido únicamente de números. Ejemplos válidos: RF1, RF05, RF100."
            );
        }
    }

    // ----------------------------------------------------
    // REGISTRAR REFERENCIA
    // ----------------------------------------------------
    public Referencia registrar(Referencia referencia) {

        referencia.setCodigo(referencia.getCodigo().trim().toUpperCase());
        referencia.setNombre(referencia.getNombre().trim());

        validarCodigoRF(referencia.getCodigo());
        ValidadorDatos.validarReferencia(referencia);

        if (referenciaRepository.findByCodigo(referencia.getCodigo()).isPresent()) {
            throw new IllegalArgumentException("El código ya está registrado.");
        }

        if (referenciaRepository.findByNombre(referencia.getNombre()).isPresent()) {
            throw new IllegalArgumentException("El nombre ya está registrado.");
        }

        return referenciaRepository.save(referencia);
    }

    // ----------------------------------------------------
    // OBTENER SOLO ACTIVAS
    // ----------------------------------------------------
    public List<Referencia> obtenerActivas() {
        return referenciaRepository.findByActivoTrue();
    }

    // ----------------------------------------------------
    // OBTENER SOLO INACTIVAS
    // ----------------------------------------------------
    public List<Referencia> obtenerInactivas() {
        return referenciaRepository.findByActivoFalse();
    }

    // ----------------------------------------------------
    // OBTENER TODAS (ACTIVAS + INACTIVAS)
    // ----------------------------------------------------
    public List<Referencia> obtenerTodas() {
        return referenciaRepository.findAll();
    }

    // ----------------------------------------------------
    // OBTENER POR ID
    // ----------------------------------------------------
    public Referencia obtenerPorId(Long id) {
        return referenciaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Referencia no encontrada."));
    }

    // ----------------------------------------------------
    // ACTUALIZAR REFERENCIA
    // ----------------------------------------------------
    public Referencia actualizar(Long id, Referencia nuevosDatos) {

        Referencia referencia = referenciaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Referencia no encontrada."));

        nuevosDatos.setCodigo(nuevosDatos.getCodigo().trim().toUpperCase());
        nuevosDatos.setNombre(nuevosDatos.getNombre().trim());

        validarCodigoRF(nuevosDatos.getCodigo());
        ValidadorDatos.validarReferencia(nuevosDatos);

        referenciaRepository.findByCodigo(nuevosDatos.getCodigo())
                .ifPresent(r -> {
                    if (!r.getIdReferencia().equals(id)) {
                        throw new IllegalArgumentException("El código ya existe en otra referencia.");
                    }
                });

        referenciaRepository.findByNombre(nuevosDatos.getNombre())
                .ifPresent(r -> {
                    if (!r.getIdReferencia().equals(id)) {
                        throw new IllegalArgumentException("El nombre ya existe en otra referencia.");
                    }
                });

        referencia.setCodigo(nuevosDatos.getCodigo());
        referencia.setNombre(nuevosDatos.getNombre());
        referencia.setActivo(nuevosDatos.isActivo());

        return referenciaRepository.save(referencia);
    }

    // ----------------------------------------------------
    // ELIMINAR (LÓGICO)
    // ----------------------------------------------------
    public void eliminar(Long id) {

        Referencia referencia = referenciaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("La referencia no existe."));

        if (!referencia.isActivo()) {
            throw new IllegalArgumentException("La referencia ya está eliminada.");
        }

        referencia.setActivo(false);
        referenciaRepository.save(referencia);
    }

    // ----------------------------------------------------
    // OBTENER POR CÓDIGO
    // ----------------------------------------------------
    public Referencia obtenerPorCodigo(String codigo) {
        return referenciaRepository.findByCodigo(codigo)
                .orElseThrow(() -> new IllegalArgumentException("Referencia no encontrada."));
    }

    // ----------------------------------------------------
    // OBTENER POR ESTADO
    // ----------------------------------------------------
    public List<Referencia> obtenerPorEstado(boolean activo) {
        return referenciaRepository.findByActivo(activo);
    }
}
