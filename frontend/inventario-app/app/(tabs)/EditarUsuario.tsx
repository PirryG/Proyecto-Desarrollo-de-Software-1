import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { actualizarUsuario } from '../../services/usuarioService';

export default function EditarUsuario() {
  const [usuario, setUsuario] = useState<any>(null);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cedula, setCedula] = useState('');
  const router = useRouter();

  // 🔹 Cargar datos del usuario
  useEffect(() => {
    const cargarDatos = async () => {
      const data = await AsyncStorage.getItem('usuario');
      if (!data) {
        Alert.alert('Error', 'No hay sesión activa. Inicia sesión nuevamente.');
        router.replace('/login');
        return;
      }

      const user = JSON.parse(data);
      setUsuario(user);
      setNombre(user.nombre || '');
      setCorreo(user.correo || '');
      setCedula(user.cedula || '');
    };

    cargarDatos();
  }, []);

  // 🔹 Guardar cambios
  const handleGuardar = async () => {
    if (!nombre || !correo) {
      Alert.alert('Error', 'Por favor completa los campos de nombre y correo.');
      return;
    }

    try {
      // Crear objeto con solo los campos modificables
      const datosActualizados: any = {
        ...usuario,
        nombre,
        correo,
      };

      // Solo incluir la contraseña si el usuario escribió algo
      if (contrasena.trim() !== '') {
        datosActualizados.contrasena = contrasena;
      }

      const response = await actualizarUsuario(usuario.idUsuario, datosActualizados);

      // Actualizar almacenamiento local
      await AsyncStorage.setItem('usuario', JSON.stringify(response));

      Alert.alert('Éxito', 'Tus datos se actualizaron correctamente.');
      router.replace('/home');
    } catch (error) {
      console.error('❌ Error al actualizar usuario:', error);
      Alert.alert('Error', 'No se pudo actualizar la información.');
    }
  };

  if (!usuario) {
    return (
      <View style={styles.container}>
        <Text>Cargando información...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Perfil</Text>

      <TextInput
        style={[styles.input, styles.disabledInput]}
        value={cedula}
        editable={false}
        placeholder="Cédula"
      />

      <TextInput
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
        placeholder="Nombre"
      />

      <TextInput
        style={styles.input}
        value={correo}
        onChangeText={setCorreo}
        placeholder="Correo"
      />

      <TextInput
        style={styles.input}
        secureTextEntry
        value={contrasena}
        onChangeText={setContrasena}
        placeholder="Contraseña (solo si deseas cambiarla)"
      />

      <Button title="Guardar cambios" onPress={handleGuardar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  disabledInput: {
    backgroundColor: '#f2f2f2',
    color: '#999',
  },
});
