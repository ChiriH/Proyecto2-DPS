import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Importar el hook
import auth from '@react-native-firebase/auth';
import globalStyles from '../styles/globalStyles';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }
    try {
      // Inicio de sesión con Firebase Auth
      await auth().signInWithEmailAndPassword(email, password);
      
      Alert.alert('Inicio de Sesión', 'Inicio de sesión exitoso.');

    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register'); 
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Iniciar Sesión</Text>
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
      <TouchableOpacity style={globalStyles.button} onPress={handleLogin}>
        <Text style={globalStyles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={navigateToRegister}>
        <Text style={[globalStyles.linkText, { marginTop: 20 }]}>
          ¿No tienes cuenta? Regístrate
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;
