
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
 
import auth from '@react-native-firebase/auth';
import globalStyles from '../styles/globalStyles';
import firestore from '@react-native-firebase/firestore';


const EventHistoryScreen = ({ isAdmin }: { isAdmin: boolean }) => {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const currentUser = auth().currentUser;

    if (!currentUser) {
      // Si el usuario no está autenticado 
      return;
    }
    const fetchEvents = () => {
      const query = isAdmin
        ? firestore().collection('events')
        : firestore()
            .collection('events')
            .where('participants', 'array-contains', currentUser.uid);

      const unsubscribe = query.onSnapshot(snapshot => {
        const eventsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(eventsList);
      });

      return unsubscribe;
    };

    const unsubscribe = fetchEvents();
    return () => unsubscribe();
  }, [isAdmin]);
  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>
        {isAdmin ? 'Historial de Todos los Eventos' : 'Tu Historial de Eventos'}
      </Text>
      <FlatList
        data={events}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={globalStyles.card}>
            <Text style={globalStyles.cardTitle}>{item.title}</Text>
            <Text>{item.description}</Text>
            <Text>{item.date}</Text>
            <Text>
              Estado: {item.status === 'closed' ? 'Cerrado' : 'Abierto'}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  eventItem: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 15,
    marginBottom: 15,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EventHistoryScreen;
