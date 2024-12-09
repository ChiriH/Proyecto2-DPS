import React, { useState, useEffect }  from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import firebase from 'firebase/app';
import firestore from '@react-native-firebase/firestore';
import HomeScreen from '../screens/HomeScreen';
import EventSearchScreen from '../screens/EventSearchScreen';
import CreateEventScreen from '../screens/CreateEventScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import EditEventScreen from '../screens/EditEventScreen';
import { Ionicons } from '@expo/vector-icons'; 

// Pantallas de usuarios no autenticados
// import IndexScreen from '../../app/(tabs)/index';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
 
import EventHistoryScreen from '../screens/EventHistoryScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const AuthenticatedTabs = ({ isAdmin }: { isAdmin: boolean }) => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
      <Tab.Screen name="EventSearch" component={EventSearchScreen} options={{ title: 'Eventos' }} />
      {isAdmin && (
        <Tab.Screen name="CreateEvent" component={CreateEventScreen} options={{ title: 'Crear Evento' }} />

      )} 
         {!isAdmin && (
            <Tab.Screen name="EventHistory" component={EventHistoryScreen} options={{ title: 'Historial de Eventos' }} />
      )}   
  
      <Tab.Screen name="Profile" component={UserProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
};

const UnauthenticatedStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Iniciar Sesión' }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Registrarse' }} />
    </Stack.Navigator>
  );
};
const AppStack = createNativeStackNavigator();
const Routes = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Estado para manejar el rol de usuario
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      if (user) {
        setIsAuthenticated(true);

        // Verificar si el usuario es admin
        const userDoc = await firestore().collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        setIsAdmin(userData?.isAdmin || false); // Asignar rol
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  return isAuthenticated ? (
    <Stack.Navigator>
      <Stack.Screen name="Tabs" options={{ headerShown: false }}>
        {(props) => <AuthenticatedTabs {...props} isAdmin={isAdmin} />}
      </Stack.Screen>
      {/* Aquí manejamos la navegación hacia EditEventScreen */}
      <Stack.Screen name="EditEventScreen" component={EditEventScreen} />
    </Stack.Navigator>
  ) : (
    <UnauthenticatedStack />
  );
 


};

export default Routes;
