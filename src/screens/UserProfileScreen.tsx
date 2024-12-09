import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator  } from 'react-native';
import globalStyles from '../styles/globalStyles';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const UserProfileScreen = ({ navigation }: any) => {
  const [userData, setUserData] = useState<any>(null); // Datos del usuario
  const [loading, setLoading] = useState(true); // Indicador de carga

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth().currentUser;
        if (!currentUser) {
          Alert.alert('Error', 'No estás autenticado');
          return;
        }
    
        const userDoc = await firestore().collection('users').doc(currentUser.uid).get();
        if (userDoc.exists) {
          setUserData(userDoc.data());
        } else {
          setUserData({
            name: currentUser.displayName || 'Usuario',
            email: currentUser.email,
            eventsAttended: 0,
            eventsCreated: 0,
          });
        }

          // Escuchar eventos asistidos por el usuario en tiempo real
          const attendedEventsListener = firestore()
          .collection('events')
          .where('participants', 'array-contains', currentUser.uid)
          .onSnapshot(snapshot => {
            if (!snapshot || snapshot.empty) {
              setUserData(prevData => ({
                ...prevData,
                eventsAttended: 0, // Manejo de casos vacíos
              }));
              return;
            }
        
            const attendedCount = snapshot.size;
            setUserData(prevData => ({
              ...prevData,
              eventsAttended: attendedCount,
            }));
          });

          // Escuchar eventos creados por el usuario en tiempo real
          const createdEventsListener = firestore()
          .collection('events')
          .where('createdBy', '==', currentUser.uid)
          .onSnapshot(snapshot => {
            if (!snapshot || snapshot.empty) {
              setUserData(prevData => ({
                ...prevData,
                eventsCreated: 0, // Manejo de casos vacíos
              }));
              return;
            }
        
            const createdCount = snapshot.size;
            setUserData(prevData => ({
              ...prevData,
              eventsCreated: createdCount,
            }));
          });
            

          // Limpiar los listeners cuando el componente se desmonte
          return () => {
            attendedEventsListener();
            createdEventsListener();
          };
      
      } catch (error) {
        Alert.alert('Error', 'No se pudieron cargar los datos del usuario.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);
  const handleLogout = async () => {
    try {
      await auth().signOut();
      setUserData(null); // Limpia los datos del usuario
   
      Alert.alert('Cierre de Sesión', 'Has cerrado sesión correctamente.');
     
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  if (loading) {
    return (
      <View style={globalStyles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Perfil de Usuario</Text>
      {userData ? (
        <>
          <Text style={globalStyles.text}>Nombre: {userData.name || 'No especificado'}</Text>
          <Text style={globalStyles.text}>Correo Electrónico: {userData.email}</Text>
          <Text style={globalStyles.text}>Eventos Asistidos: {userData?.eventsAttended ?? 0}</Text>
          <Text style={globalStyles.text}>Eventos Creados: {userData.eventsCreated || 0}</Text>

       
          <TouchableOpacity style={globalStyles.button} onPress={handleLogout}>
            <Text style={globalStyles.buttonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={globalStyles.text}>No se encontraron datos del usuario.</Text>
      )}
    </View>
  );
};


export default UserProfileScreen;
