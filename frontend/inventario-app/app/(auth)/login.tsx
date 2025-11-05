import React, { useState, useCallback } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { loginUsuario } from '../../services/usuarioService';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login() {
  const [cedula, setCedula] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [bloqueado, setBloqueado] = useState(false);
  const router = useRouter();

  // 🧠 Verifica si ya hay sesión activa al entrar al login
  useFocusEffect(
    useCallback(() => {
      const verificarSesion = async () => {
        const usuarioGuardado = await AsyncStorage.getItem('usuario');
        if (usuarioGuardado) {
          const usuario = JSON.parse(usuarioGuardado);
          console.log('🔹 Sesión activa detectada:', usuario);
          setBloqueado(true);
          router.replace({
            pathname: '/home',
            params: {
              nombre: usuario.nombre,
              rol: usuario.rol,
              idUsuario: usuario.idUsuario?.toString(),
            },
          });
        } else {
          console.log('🧹 No hay sesión activa, desbloqueando login.');
          setBloqueado(false);
          setCedula('');
          setContrasena('');
        }
      };

      verificarSesion();
    }, [router])
  );

  // 🔹 Manejar inicio de sesión
  const handleLogin = async () => {
    if (!cedula || !contrasena) {
      Alert.alert('Error', 'Por favor ingresa tu cédula y contraseña.');
      return;
    }

    try {
      const usuario = await loginUsuario(cedula, contrasena);
      console.log('✅ Usuario logueado correctamente:', usuario);

      await AsyncStorage.setItem('usuario', JSON.stringify(usuario));
      setBloqueado(true);

      router.replace({
        pathname: '/home',
        params: {
          nombre: usuario.nombre,
          rol: usuario.rol,
          idUsuario: usuario.idUsuario?.toString(),
        },
      });
    } catch (error: any) {
      console.error('❌ Error al iniciar sesión:', error);

      // 🔹 Asegurar que el mensaje venga del backend o usar uno genérico
      const mensaje =
        error?.message ||
        error?.response?.data ||
        'Usuario o contraseña incorrectos.';

      Alert.alert('Error de inicio de sesión', mensaje);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>

      <TextInput
        placeholder="Cédula"
        value={cedula}
        onChangeText={setCedula}
        editable={!bloqueado}
        style={[styles.input, bloqueado && styles.inputDisabled]}
      />
      <TextInput
        placeholder="Contraseña"
        secureTextEntry
        value={contrasena}
        onChangeText={setContrasena}
        editable={!bloqueado}
        style={[styles.input, bloqueado && styles.inputDisabled]}
      />

      <View style={styles.buttonContainer}>
        <Button
          title="Ingresar"
          onPress={handleLogin}
          disabled={bloqueado}
          color={bloqueado ? '#aaa' : '#007AFF'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  inputDisabled: {
    backgroundColor: '#f2f2f2',
    color: '#999',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 10,
  },
});
