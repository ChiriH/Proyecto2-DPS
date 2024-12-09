import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import globalStyles from '../styles/globalStyles';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
const CreateEventScreen = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');

  const handleCreateEvent = async () => {
    const user = await auth().currentUser;
    if (!user) {
      Alert.alert('Error', 'Debes estar autenticado para crear un evento.');
      return;
    }

    if (!title || !description || !location || !date) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }
    try {
      const eventData = {
        title,
        description,
        location,
        date,
        createdAt: firestore.FieldValue.serverTimestamp(),
        participants: [],
      };
      await firestore().collection('events').add(eventData);
      
      Alert.alert('Evento creado', 'El evento se creó con éxito.');
      // Limpiar los campos después de crear el evento
      setTitle('');
      setDescription('');
      setDate('');
      setLocation('');
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al crear el evento.');
      console.error(error);
    }
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Crear Nuevo Evento</Text>
      <TextInput
        style={globalStyles.input}
        placeholder="Título del Evento"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Descripción"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Fecha (YYYY-MM-DD)"
        value={date}
        onChangeText={setDate}
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Ubicación"
        value={location}
        onChangeText={setLocation}
      />
      <TouchableOpacity style={globalStyles.button} onPress={handleCreateEvent}>
        <Text style={globalStyles.buttonText}>Crear Evento</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CreateEventScreen;
