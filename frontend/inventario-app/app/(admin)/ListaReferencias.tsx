import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Button,
  TextInput,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

import {
  obtenerReferenciasActivas,
  obtenerReferenciasInactivas,
  obtenerReferenciaPorId,
  actualizarReferencia,
} from "../../services/referenciaService";

export default function ListaReferencias() {
  const [referencias, setReferencias] = useState<any[]>([]);
  const [referenciasFiltradas, setReferenciasFiltradas] = useState<any[]>([]);
  const [searchCodigo, setSearchCodigo] = useState("");
  const [usuarioActual, setUsuarioActual] = useState<any | null>(null);

  const [loadingLista, setLoadingLista] = useState(false);
  const [loadingAccionId, setLoadingAccionId] = useState<number | null>(null);

  const [mostrarActivas, setMostrarActivas] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const verificarYcargar = async () => {
      const data = await AsyncStorage.getItem("usuario");

      if (!data) {
        Alert.alert("Sesión expirada", "Debes iniciar sesión nuevamente.");
        router.replace("/login");
        return;
      }

      const user = JSON.parse(data);
      setUsuarioActual(user);

      if (user.rol !== "ADMIN") {
        Alert.alert("Acceso denegado", "Solo los administradores pueden ver esta sección.");
        router.replace("/home");
        return;
      }

      await cargarReferencias();
    };

    verificarYcargar();
  }, [mostrarActivas]);

  const cargarReferencias = async () => {
    try {
      setLoadingLista(true);
      let lista = mostrarActivas
        ? await obtenerReferenciasActivas()
        : await obtenerReferenciasInactivas();

      const listaOrdenada = lista.sort((a: any, b: any) =>
        a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
      );

      setReferencias(listaOrdenada);
      setReferenciasFiltradas(listaOrdenada);
    } catch (error) {
      console.error("Error al cargar referencias:", error);
      Alert.alert("Error", "No se pudo cargar la lista de referencias.");
    } finally {
      setLoadingLista(false);
    }
  };

  useEffect(() => {
    let lista = referencias;

    if (searchCodigo.trim() !== "") {
      lista = lista.filter((ref) =>
        String(ref.codigo).toLowerCase().includes(searchCodigo.toLowerCase())
      );
    }

    setReferenciasFiltradas(lista);
  }, [searchCodigo, referencias]);

  const toggleEstado = (ref: any) => {
    Alert.alert(
      ref.activo ? "Desactivar referencia" : "Activar referencia",
      `¿Estás seguro de ${ref.activo ? "desactivar" : "activar"} "${ref.nombre}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Aceptar",
          onPress: async () => {
            setLoadingAccionId(ref.idReferencia);
            try {
              const referenciaActual = await obtenerReferenciaPorId(ref.idReferencia);

              const payload = {
                ...referenciaActual,
                activo: !referenciaActual.activo,
              };

              await actualizarReferencia(ref.idReferencia, payload);

              Alert.alert(
                "Éxito",
                `Referencia ${payload.activo ? "activada" : "desactivada"} correctamente.`
              );

              await cargarReferencias();
            } catch (error) {
              console.error("Error al cambiar estado:", error);
              Alert.alert("Error", "No se pudo cambiar el estado.");
            } finally {
              setLoadingAccionId(null);
            }
          },
        },
      ]
    );
  };

  const renderReferencia = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={styles.nombre}>{item.nombre}</Text>
      <Text>Código: {item.codigo}</Text>
      <Text>Estado: {item.activo ? "Activa" : "Inactiva"}</Text>

      <View style={styles.botones}>
        <Button
          title="Editar"
          onPress={() =>
            router.push({
              pathname: "/editarReferencia",
              params: { id: item.idReferencia },
            })
          }
        />

        <View style={{ width: 120 }}>
          {loadingAccionId === item.idReferencia ? (
            <ActivityIndicator size="small" />
          ) : (
            <Button
              title={item.activo ? "Desactivar" : "Activar"}
              color={item.activo ? "red" : "green"}
              onPress={() => toggleEstado(item)}
            />
          )}
        </View>
      </View>
    </View>
  );

  if (loadingLista) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" />
        <Text>Cargando referencias...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Referencias</Text>

      <Button
        title={
          mostrarActivas
            ? "Mostrando: ACTIVAS (ver INACTIVAS)"
            : "Mostrando: INACTIVAS (ver ACTIVAS)"
        }
        onPress={() => setMostrarActivas(!mostrarActivas)}
        color={mostrarActivas ? "green" : "red"}
      />

      <TextInput
        style={styles.input}
        placeholder="Buscar por código..."
        value={searchCodigo}
        onChangeText={setSearchCodigo}
      />

      <FlatList
        data={referenciasFiltradas}
        renderItem={renderReferencia}
        keyExtractor={(item) => item.idReferencia.toString()}
      />

      {referenciasFiltradas.length === 0 && (
        <Text style={{ textAlign: "center", marginTop: 10 }}>
          No hay referencias {mostrarActivas ? "activas" : "inactivas"}.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  nombre: { fontWeight: "bold", fontSize: 16 },
  botones: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
});
