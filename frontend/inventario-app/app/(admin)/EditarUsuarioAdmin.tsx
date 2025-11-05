import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { actualizarUsuario, obtenerUsuarioPorId } from '../../services/usuarioService';

export default function EditarUsuarioAdmin() {
  const router = useRouter();
  const { idUsuario } = useLocalSearchParams();
  const [usuarioAdmin, setUsuarioAdmin] = useState<any>(null);
  const [usuarioEditado, setUsuarioEditado] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [rol, setRol] = useState('');

  // 🔹 Verificar que el usuario sea ADMIN
  useEffect(() => {
    const verificarAcceso = async () => {
      const data = await AsyncStorage.getItem('usuario');
      if (!data) {
        Alert.alert('Sesión expirada', 'Debes iniciar sesión nuevamente.');
        router.replace('/login');
        return;
      }
      const user = JSON.parse(data);
      if (user.rol !== 'ADMIN') {
        Alert.alert('Acceso denegado', 'Solo los administradores pueden editar usuarios.');
        router.replace('/home');
        return;
      }
      setUsuarioAdmin(user);
    };
    verificarAcceso();
  }, []);

  // 🔹 Cargar datos del usuario a editar
  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        if (!idUsuario) {
          console.log('⚠️ No se recibió idUsuario');
          return;
        }

        const idValido =
          Array.isArray(idUsuario) ? parseInt(idUsuario[0]) : parseInt(idUsuario as string);

        if (isNaN(idValido)) {
          console.log('⚠️ idUsuario no es un número válido:', idUsuario);
          return;
        }

        console.log('📡 Obteniendo usuario con ID:', idValido);
        const data = await obtenerUsuarioPorId(idValido);
        console.log('✅ Usuario cargado:', data);

        setUsuarioEditado(data);
        setNombre(data.nombre);
        setCedula(data.cedula.toString());
        setCorreo(data.correo);
        setRol(data.rol);
      } catch (error) {
        console.error('❌ Error al cargar usuario:', error);
        Alert.alert('Error', 'No se pudo cargar la información del usuario.');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    cargarUsuario();
  }, [idUsuario]);

  // 🔹 Actualizar usuario
  const handleActualizar = async () => {
    if (!nombre || !cedula || !correo || !rol) {
      Alert.alert('Error', 'Por favor llena todos los campos requeridos.');
      return;
    }

    try {
      const idValido =
        Array.isArray(idUsuario) ? parseInt(idUsuario[0]) : parseInt(idUsuario as string);

      if (isNaN(idValido)) {
        Alert.alert('Error', 'ID de usuario inválido.');
        return;
      }

      const datosActualizados: Record<string, any> = {
        nombre,
        cedula,
        correo,
        rol: rol.toUpperCase(),
      };

      if (contrasena.trim() !== '') {
        datosActualizados.contrasena = contrasena;
      }

      console.log('📤 Enviando datos actualizados:', datosActualizados);
      await actualizarUsuario(idValido, datosActualizados);
      Alert.alert('Éxito', 'Usuario actualizado correctamente.');
      router.push('/ListaUsuarios');
    } catch (error: any) {
  console.error('❌ Error al actualizar usuario:', error);

  // 🧩 Intentar obtener mensaje detallado del backend
  const mensajeError =
    error.response?.data || // cuando el backend manda texto plano
    error.response?.data?.message || // si manda JSON { message: ... }
    'No se pudo actualizar el usuario.';

  Alert.alert('Error', mensajeError);
}
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Cargando usuario...</Text>
      </View>
    );
  }

  if (!usuarioEditado) {
    return (
      <View style={styles.container}>
        <Text>No se encontró el usuario.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Usuario</Text>

      <TextInput placeholder="Nombre" value={nombre} onChangeText={setNombre} style={styles.input} />
      <TextInput
  placeholder="Cédula"
  value={cedula}
  onChangeText={setCedula}
  editable={usuarioAdmin?.rol === 'ADMIN'} // ✅ solo editable si es admin
  style={[
    styles.input,
    usuarioAdmin?.rol !== 'ADMIN' && styles.disabledInput, // gris si no es admin
  ]}
/>

      <TextInput placeholder="Correo" value={correo} onChangeText={setCorreo} style={styles.input} />
      <TextInput
        placeholder="Nueva contraseña (opcional)"
        secureTextEntry
        value={contrasena}
        onChangeText={setContrasena}
        style={styles.input}
      />
      <TextInput
        placeholder="Rol (ADMIN o USER)"
        value={rol}
        onChangeText={setRol}
        style={styles.input}
      />

      <View style={styles.buttonContainer}>
        <Button title="Actualizar Usuario" onPress={handleActualizar} />
      </View>

      <View style={{ marginTop: 10 }}>
        <Button title="Cancelar" color="gray" onPress={() => router.push('/ListaUsuarios')} />
      </View>
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
    backgroundColor: '#eee',
    color: '#666',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 10,
  },
});
