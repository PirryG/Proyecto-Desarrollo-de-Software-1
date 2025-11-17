import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet, Switch } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  obtenerReferenciaPorId,
  actualizarReferencia,
} from "../../services/referenciaService";

export default function EditarReferencia() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Normalizar ID (puede venir como string o string[])
  const idStr = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = Number(idStr);

  const [usuario, setUsuario] = useState<any>(null);
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [activo, setActivo] = useState(true);

  useEffect(() => {
    const init = async () => {
      // Validar sesión
      const data = await AsyncStorage.getItem("usuario");

      if (!data) {
        Alert.alert("Sesión expirada", "Debes iniciar sesión.");
        router.replace("/login");
        return;
      }

      const user = JSON.parse(data);

      if (user.rol !== "ADMIN") {
        Alert.alert("Acceso denegado", "No tienes permisos para editar referencias.");
        router.replace("/home");
        return;
      }

      setUsuario(user);

      // Validar ID
      if (!id || isNaN(id)) {
        Alert.alert("Error", "ID de referencia inválido.");
        router.back();
        return;
      }

      // Cargar datos de referencia
      try {
        const referencia = await obtenerReferenciaPorId(id);
        setCodigo(referencia.codigo);
        setNombre(referencia.nombre);
        setActivo(referencia.activo);
      } catch (err) {
        console.error("Error cargando referencia:", err);
        Alert.alert("Error", "No se pudo cargar la referencia.");
      }
    };

    init();
  }, []);

  // Guardar cambios
  const handleActualizar = async () => {
    if (!codigo || !nombre) {
      Alert.alert("Error", "Todos los campos son obligatorios.");
      return;
    }

    try {
      const payload = { codigo, nombre, activo };

      await actualizarReferencia(id, payload);

      Alert.alert("Éxito", "Referencia actualizada correctamente.");
      router.push("/home");
    } catch (error: any) {
      console.error("Error al actualizar referencia:", error);
      Alert.alert("Error", "No se pudo actualizar la referencia.");
    }
  };

  if (!usuario) {
    return (
      <View style={styles.container}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Referencia</Text>

      <TextInput
        placeholder="Código"
        value={codigo}
        onChangeText={setCodigo}
        style={styles.input}
      />

      <TextInput
        placeholder="Nombre de la referencia"
        value={nombre}
        onChangeText={setNombre}
        style={styles.input}
      />

      <View style={styles.row}>
        <Text style={styles.label}>Activo:</Text>
        <Switch value={activo} onValueChange={setActivo} />
      </View>

      <Button title="Guardar cambios" onPress={handleActualizar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  label: { fontSize: 16, marginRight: 10 },
});
