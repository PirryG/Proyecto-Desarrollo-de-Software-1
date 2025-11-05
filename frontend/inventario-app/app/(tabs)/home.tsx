import React, { useState, useCallback } from 'react';
import { View, Text, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Home() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Cargar usuario cada vez que la pantalla está en foco
  useFocusEffect(
    useCallback(() => {
      const cargarUsuario = async () => {
        try {
          const data = await AsyncStorage.getItem('usuario');
          if (data) {
            const user = JSON.parse(data);
            console.log('✅ Usuario cargado desde storage:', user);
            setUsuario(user);
          } else {
            console.log('⚠️ No hay usuario guardado, redirigiendo al login');
            setUsuario(null);
            router.replace('/login');
          }
        } catch (error) {
          console.error('❌ Error al leer usuario del AsyncStorage:', error);
          Alert.alert('Error', 'Hubo un problema cargando tu perfil');
          router.replace('/login');
        } finally {
          setLoading(false);
        }
      };

      cargarUsuario();
    }, [router])
  );

  // 🔹 Cerrar sesión
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('usuario');
      setUsuario(null);
      Alert.alert('Sesión cerrada', 'Has cerrado sesión correctamente.');
      router.replace('/login');
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      Alert.alert('Error', 'No se pudo cerrar sesión');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Cargando perfil...</Text>
      </View>
    );
  }

  if (!usuario) {
    return (
      <View style={styles.container}>
        <Text>No hay sesión activa</Text>
        <Button title="Volver al Login" onPress={() => router.replace('/login')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { marginTop: 50 }]}>
  👋 Bienvenido, {usuario.nombre}
    </Text>
      <Text>Cédula: {usuario.cedula}</Text>
      <Text>Correo: {usuario.correo}</Text>
      <Text>Rol: {usuario.rol}</Text>

      {/*Botón solo visible si es ADMIN */}
      {usuario.rol === 'ADMIN' ? (
        <>
          <View style={{ marginTop: 20 }}>
            <Button
              title="Lista de usuarios"
              color="#153cc7ff"
              onPress={() => router.push('/(admin)/ListaUsuarios')}
            />
          </View>

          <View style={{ marginTop: 15 }}>
            <Button
              title="Registrar Usuario"
              color="#007AFF"
              onPress={() =>
                router.push({
                  pathname: '/RegistrarUsuario',
                  params: {
                    rol: usuario.rol,
                    nombre: usuario.nombre,
                    idUsuario: usuario.idUsuario?.toString(),
                  },
                })
              }
            />
          </View>
        </>
      ) : (
        <Text style={{ marginTop: 20 }}>No tienes permisos de administración.</Text>
      )}

      <View style={{ marginTop: 30 }}>
        <Button title="Cerrar Sesión" color="red" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center', // centra horizontalmente
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 50, // 👈 separa el texto del borde superior
    marginBottom: 20,
    textAlign: 'center', // 👈 centra el texto
    color: '#153cc7', // un azul elegante
  },
});
