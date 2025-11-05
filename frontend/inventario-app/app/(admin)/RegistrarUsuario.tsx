import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { registrarUsuario } from '../../services/usuarioService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegistrarUsuario() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [rolNuevo, setRolNuevo] = useState('USER');

  // 🔒 Verificar sesión y rol al montar y al volver a la pantalla
  const verificarAcceso = async () => {
    const data = await AsyncStorage.getItem('usuario');
    if (!data) {
      Alert.alert('Sesión expirada', 'Debes iniciar sesión nuevamente.');
      router.replace('/login');
      return;
    }

    const user = JSON.parse(data);
    if (user.rol !== 'ADMIN') {
      Alert.alert('Acceso denegado', 'No tienes permisos para registrar usuarios.');
      router.replace('/home');
      return;
    }

    setUsuario(user);
  };

  useEffect(() => {
    verificarAcceso();
  }, []);

  // 🔁 También verificar cada vez que se vuelve a esta pantalla
  useFocusEffect(
    React.useCallback(() => {
      verificarAcceso();
    }, [])
  );

  const handleRegistrar = async () => {
    if (!nombre || !cedula || !correo || !contrasena) {
      Alert.alert('Error', 'Por favor llena todos los campos.');
      return;
    }

    try {
      const nuevoUsuario = {
        nombre,
        cedula,
        correo,
        contrasena,
        rol: rolNuevo.toUpperCase(),
      };

      const response = await registrarUsuario(nuevoUsuario);
      Alert.alert('Éxito', `Usuario ${response.nombre} registrado correctamente`);
      router.push('/home');
    } catch (error: any) {
  console.error('❌ Error al registrar usuario:', error.response?.data || error.message);

  Alert.alert(
    'Error',
    error.response?.data || 'No se pudo registrar el usuario.'
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
      <Text style={styles.title}>Registrar Nuevo Usuario</Text>

      <TextInput placeholder="Nombre" value={nombre} onChangeText={setNombre} style={styles.input} />
      <TextInput placeholder="Cédula" value={cedula} onChangeText={setCedula} style={styles.input} />
      <TextInput placeholder="Correo" value={correo} onChangeText={setCorreo} style={styles.input} />
      <TextInput placeholder="Contraseña" value={contrasena} secureTextEntry onChangeText={setContrasena} style={styles.input} />
      <TextInput placeholder="Rol (ADMIN o USER)" value={rolNuevo} onChangeText={setRolNuevo} style={styles.input} />

      <Button title="Registrar" onPress={handleRegistrar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 5, borderRadius: 5 },
});
