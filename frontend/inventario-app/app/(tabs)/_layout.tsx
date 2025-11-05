import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TabsLayout() {
  const [rol, setRol] = useState<string | null>(null);

  // 🔹 Cargar el rol actual desde AsyncStorage
  useEffect(() => {
    const cargarRol = async () => {
      try {
        const data = await AsyncStorage.getItem('usuario');
        if (data) {
          const usuario = JSON.parse(data);
          setRol(usuario.rol);
        } else {
          setRol(null);
        }
      } catch (error) {
        console.error('❌ Error al obtener rol desde AsyncStorage:', error);
        setRol(null);
      }
    };

    cargarRol();

    // 🔁 Escuchar cambios en AsyncStorage (por ejemplo, al cerrar sesión)
    const interval = setInterval(cargarRol, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Tabs>
      {/* 🔹 Siempre visible */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Inicio',
          headerShown: true,
        }}
      />

      <Tabs.Screen
        name="RegistrarUsuario"
        options={{
          title: 'Registrar Usuario',
          headerShown: true,
        }}
      />

      <Tabs.Screen
        name="EditarUsuario"
        options={{
          title: 'Editar Perfil',
          headerShown: true,
        }}
      />

      {/* 👇 Solo visible si el usuario tiene rol ADMIN */}
      {rol === 'ADMIN' && (
        <>
          <Tabs.Screen
            name="ListaUsuarios"
            options={{
              title: 'Usuarios',
              headerShown: true,
            }}
          />

          <Tabs.Screen
            name="EditarUsuarioAdmin"
            options={{
              title: 'Editar Usuario (Admin)',
              headerShown: true,
            }}
          />
        </>
      )}
    </Tabs>
  );
}
