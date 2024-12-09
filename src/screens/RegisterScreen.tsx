import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import globalStyles from '../styles/globalStyles';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }
    try {
      // Crear usuario en Firebase Authentication
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const { uid } = userCredential.user;

      const usersSnapshot = await firestore().collection('users').get();

      const isAdmin = usersSnapshot.empty; 
      // Guardar datos del usuario en Firestore
      await firestore().collection('users').doc(uid).set({
        name,
        email,
        isAdmin,
        eventsAttended: [], // Eventos a los que asistió
        eventsCreated: [],  // Eventos creados (si es admin)
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
      Alert.alert(isAdmin ? 'Administrador creado' : 'Usuario  creado');
      Alert.alert('Registro', 'Registro exitoso.');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Registro</Text>
      <TextInput
        style={globalStyles.input}
        placeholder="Nombre Completo"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Correo Electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Confirmar Contraseña"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <TouchableOpacity style={globalStyles.button} onPress={handleRegister}>
        <Text style={globalStyles.buttonText}>Registrar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegisterScreen;
