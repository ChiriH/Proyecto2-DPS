import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import globalStyles from '../styles/globalStyles';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
interface Stats {
  totalEvents: number;
  totalParticipants: number;
  averageRating: string;
}
const HomeScreen = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalParticipants: 0,
    averageRating: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = auth().currentUser;

      if (!currentUser) {
        Alert.alert('Error', 'Debes iniciar sesión para ver los eventos.');
        return;
      }

      const userDoc = await firestore().collection('users').doc(currentUser.uid).get();
      const adminStatus = userDoc.exists && userDoc.data()?.isAdmin;
      setIsAdmin(adminStatus);

      const eventsQuery = adminStatus
        ? firestore().collection('events')
        : firestore()
            .collection('events')
            .where('participants', 'array-contains', currentUser.uid);

            const unsubscribe = eventsQuery.onSnapshot(snapshot => {
              if (!snapshot || snapshot.empty) {
                setEvents([]); // No hay eventos
                return;
              }
            
              const eventsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              setEvents(eventsData);
            
              if (adminStatus) {
                const totalEvents = eventsData.length;
                const totalParticipants = eventsData.reduce(
                  (acc, event) => acc + (event.participants?.length || 0),
                  0
                );
                const allRatings = eventsData.flatMap(event =>
                  event.reviews?.map((review: any) => review.rating) || []
                );
                const averageRating =
                  allRatings.length > 0
                    ? (allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length).toFixed(1)
                    : 0;
            
                setStats({ totalEvents, totalParticipants, averageRating });
              }
            });

      return () => unsubscribe();
    };

    fetchData();
  }, []);

  return (
    <View style={globalStyles.container}>
    <Text style={globalStyles.title}>
      {isAdmin ? 'Estadísticas y Comentarios' : 'Eventos Programados'}
    </Text>

    {isAdmin ? (
      <View>
        {/* Vista de administrador */}
        <Text style={globalStyles.text}>Total de eventos: {stats.totalEvents}</Text>
        <Text style={globalStyles.text}>Total de participantes: {stats.totalParticipants}</Text>
        <Text style={globalStyles.text}>Promedio de calificaciones: {stats.averageRating}</Text>
        <Text style={[globalStyles.text, { marginTop: 10 }]}>Eventos y Comentarios:</Text>
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={globalStyles.card}>
              <Text style={globalStyles.cardTitle}>{item.title}</Text>
              <FlatList
                data={item.reviews || []}
                keyExtractor={(review, index) => `${item.id}-review-${index}`}
                renderItem={({ item: review }) => (
                  <Text style={globalStyles.text}>
                    {review.userId}: {review.review} (Calificación: {review.rating})
                  </Text>
                )}
              />
            </View>
          )}
        />
      </View>
    ) : (
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleEventClick(item.title, item.date, item.description)}
            style={globalStyles.card}
          >
            <View>
              <Text style={globalStyles.cardTitle}>{item.title}</Text>
              <Text>{item.date}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    )}
  </View>
);
};

export default HomeScreen;
