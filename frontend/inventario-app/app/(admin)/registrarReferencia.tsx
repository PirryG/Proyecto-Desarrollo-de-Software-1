import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registrarReferencia } from "../../services/referenciaService";

export default function RegistrarReferencia() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);

  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");

  // 🔐 Verificar sesión y rol
  const verificarAcceso = async () => {
    try {
      const data = await AsyncStorage.getItem("usuario");

      if (!data) {
        Alert.alert("Sesión expirada", "Debes iniciar sesión.");
        router.replace("/login");
        return;
      }

      const user = JSON.parse(data);

      if (user.rol !== "ADMIN") {
        Alert.alert("Acceso denegado", "Solo un admin puede crear referencias.");
        router.replace("/home");
        return;
      }

      setUsuario(user);
    } catch (error) {
      console.error("Error verificando sesión:", error);
    }
  };

  useEffect(() => {
    verificarAcceso();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      verificarAcceso();
    }, [])
  );

  const handleRegistrar = async () => {
    if (!codigo || !nombre) {
      Alert.alert("Error", "Por favor llena todos los campos.");
      return;
    }

    try {
      const nuevaReferencia = {
        codigo,
        nombre,
        activo: true,   // 👈 SIEMPRE TRUE AL CREAR
      };

      const response = await registrarReferencia(nuevaReferencia);

      Alert.alert(
        "Éxito",
        `Referencia ${response.codigo} creada correctamente`
      );

      router.push("/home");
    } catch (error: any) {
      console.error("Error al crear referencia:", error.response?.data || error.message);

      Alert.alert(
        "Error",
        error.response?.data || "No se pudo crear la referencia."
      );
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
      <Text style={styles.title}>Registrar Referencia</Text>

      <TextInput
        placeholder="Código (ej: R001)"
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

      <Button title="Registrar" onPress={handleRegistrar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
});
