// EditEventScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import globalStyles from '../styles/globalStyles';

const EditEventScreen = ({ route, navigation }: any) => {
  const { eventId } = route.params; // Obtenemos el ID del evento a editar
  const [eventData, setEventData] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventRef = firestore().collection('events').doc(eventId);
        const doc = await eventRef.get();
        if (doc.exists) {
          const data = doc.data();
          setEventData(data);
          setTitle(data.title);
          setDescription(data.description);
          setDate(data.date);
        } else {
          Alert.alert('Error', 'Evento no encontrado');
        }
      } catch (error) {
        Alert.alert('Error', 'No se pudo cargar el evento');
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleSaveChanges = async () => {
    try {
      const eventRef = firestore().collection('events').doc(eventId);
      await eventRef.update({
        title,
        description,
        date,
      });
      Alert.alert('Evento actualizado', 'Los detalles del evento han sido actualizados');
      navigation.goBack(); // Regresa a la pantalla anterior
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al guardar los cambios');
    }
  };

  if (!eventData) {
    return <Text>Cargando...</Text>;
  }

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Editar Evento</Text>
      <TextInput
        style={globalStyles.input}
        placeholder="Título del Evento"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Descripción del Evento"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Fecha del Evento"
        value={date}
        onChangeText={setDate}
      />
      <TouchableOpacity style={globalStyles.button} onPress={handleSaveChanges}>
        <Text style={globalStyles.buttonText}>Guardar Cambios</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EditEventScreen;
