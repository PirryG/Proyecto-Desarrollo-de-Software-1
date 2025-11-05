import React, { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator, Alert } from 'react-native';

export default function AdminLayout() {
  const [rol, setRol] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const verificarRol = async () => {
      try {
        const data = await AsyncStorage.getItem('usuario');
        if (!data) {
          Alert.alert('Sesión expirada', 'Debes iniciar sesión nuevamente.');
          router.replace('/login');
          return;
        }

        const usuario = JSON.parse(data);

        if (usuario.rol !== 'ADMIN') {
          Alert.alert('Acceso denegado', 'Solo los administradores pueden acceder aquí.');
          router.replace('/home');
          return;
        }

        setRol('ADMIN');
      } catch (error) {
        console.error('❌ Error verificando rol de usuario:', error);
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    verificarRol();
  }, []);

  // 🔄 Mostrar carga mientras verifica el rol
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // 🔒 Si no es admin, no renderiza nada
  if (rol !== 'ADMIN') {
    return null;
  }

  // ✅ Si es admin, renderiza normalmente
  return (
    <Stack>
      <Stack.Screen
        name="ListaUsuarios"
        options={{
          title: 'Usuarios',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="EditarUsuarioAdmin"
        options={{
          title: 'Editar Usuario (Admin)',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
