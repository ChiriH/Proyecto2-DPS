import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, TextInput } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import globalStyles from '../styles/globalStyles';

const EventSearchScreen = ({ navigation }: any) => {
  const [events, setEvents] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [review, setReview] = useState<string>('');


  useEffect(() => {
    const fetchEvents = async () => {
      try {
         // Verificamos si el usuario actual es administrador
         const currentUser = auth().currentUser;
         if (!currentUser) {
          console.log('El usuario no está autenticado');
          return; // Evita continuar con la lógica si el usuario no está autenticado
        }
         if (currentUser) {
           const userDoc = await firestore().collection('users').doc(currentUser.uid).get();
           setIsAdmin(userDoc.exists && userDoc.data()?.isAdmin);
         }
 

        const snapshot = await firestore().collection('events').get();
        const eventsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(eventsList);
      } catch (error) {
        Alert.alert('Error', 'Error al cargar los eventos');
      }
    };

    fetchEvents();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchEvents(); // Volver a cargar los eventos cuando la pantalla se enfoque nuevamente
    });

    return () => unsubscribe();
  }, [navigation]);

  const handleRSVP = async (eventId: string) => {
    const currentUser = auth().currentUser;

    //  currentUser exista antes de proceder
    if (!currentUser) {
      Alert.alert('Error', 'No estás autenticado');
      return;
    }
    const userId = currentUser.uid;  // Obtener el ID del usuario actual
    const eventRef = firestore().collection('events').doc(eventId);
    const userRef = firestore().collection('users').doc(userId);

    try {
      const eventDoc = await eventRef.get();
      const eventData = eventDoc.data();
      
      if (!eventData) {
        Alert.alert('Error', 'Evento no encontrado');
        return;
      }

      // Verifica si el usuario ya está en los participantes
      const isAttending = eventData.participants?.includes(userId);
      // Verifica si el evento está cerrado
      if (eventData.status === 'closed') {
        Alert.alert('Evento cerrado', 'Este evento ya está cerrado, no puedes confirmar asistencia.');
        return;
      }
      if (isAttending) {
        // Si está confirmado, quitarlo
        await eventRef.update({
          participants: firestore.FieldValue.arrayRemove(userId),  // Eliminar el usuario de los participantes
        });
        // Disminuir el contador de eventos asistidos del usuario
        await userRef.update({
          eventsAttended: firestore.FieldValue.increment(-1),
        });
        Alert.alert('Asistencia cancelada', 'Has cancelado tu asistencia al evento');
      } else {
        // Si no está confirmado, agregarlo
        await eventRef.update({
          participants: firestore.FieldValue.arrayUnion(userId),  // Agregar el usuario a los participantes
        });
        // Incrementar el contador de eventos asistidos del usuario
        await userRef.update({
          eventsAttended: firestore.FieldValue.increment(1),
        });
        Alert.alert('Asistencia confirmada', 'Has confirmado tu asistencia al evento');
      }
      // Recargar los eventos después de modificar la asistencia
      const snapshot = await firestore().collection('events').get();
      const eventsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventsList);

    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Hubo un problema al actualizar la asistencia');
    }
  };
const handleEditEvent = (eventId: string) => {
  navigation.navigate('EditEventScreen', { eventId }); // Navegar a la pantalla de edición
};
const handleCloseEvent = async (eventId: string) => {
  const eventRef = firestore().collection('events').doc(eventId);

  try {
    await eventRef.update({
      status: 'closed', // Cambiar el estado a "cerrado"
    });
    Alert.alert('Evento cerrado', 'El evento ha sido cerrado y ya no se puede modificar');
    
    // Actualizar la lista de eventos después de cerrar uno
    const snapshot = await firestore().collection('events').get();
    const eventsList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setEvents(eventsList);

  } catch (error) {
    Alert.alert('Error', 'Hubo un problema al cerrar el evento');
  }
};


const handleSubmitReview = async (eventId: string) => {
  const userId = auth().currentUser.uid;
  if (rating < 1 || rating > 5 || isNaN(rating)) {
    Alert.alert('Error', 'La calificación debe ser un número entre 1 y 5');
    return;
  }
  const eventRef = firestore().collection('events').doc(eventId);

  try {
   
    const eventDoc = await eventRef.get();
    const eventData = eventDoc.data();


    // Verificar si el usuario está en la lista de participantes
    const isParticipant = eventData?.participants?.includes(userId);
    if (!isParticipant) {
      Alert.alert(
        'Acceso denegado',
        'Solo los usuarios que asistieron al evento pueden dejar una reseña.'
      );
      return;
    }

     // Verifica si el usuario ya dejó una reseña
    const hasReviewed = eventData?.reviews?.some((review: any) => review.userId === userId);

    if (hasReviewed) {
      Alert.alert('Ya has dejado una reseña', 'Solo puedes dejar una reseña por evento.');
      return;
    }

    await eventRef.update({
      reviews: firestore.FieldValue.arrayUnion({
        userId,
        rating,
        review,
      }),
    });

    Alert.alert('Reseña enviada', 'Gracias por dejar tu reseña');
    
    // Recargar los eventos después de dejar una reseña
    const snapshot = await firestore().collection('events').get();
    const eventsList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setEvents(eventsList);

    // Limpiar campos después de enviar la reseña
    setRating(null);
    setReview('');

  } catch (error) {
    Alert.alert('Error', 'Hubo un problema al enviar la reseña');
  }
};

  return (
    <View style={globalStyles.container}>
    <Text style={globalStyles.title}>Eventos disponibles</Text>
    <FlatList
      data={events}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const isAttending = item.participants?.includes(auth().currentUser.uid); // Verifica si el usuario está confirmado
        return (
            <View style={globalStyles.card}>
              { item.status === 'closed'  &&  (<Text style={{color: 'red'}}>Evento finalizado</Text>)}
              <Text style={globalStyles.cardTitle}>{item.title}</Text>

              <Text>{item.description}</Text>
              <Text>{item.location}</Text>
              <Text>{item.date}</Text>
              
              
              
                {/* Botón de Confirmar Asistencia */}
                {!isAdmin && item.status !== 'closed' && (
                <TouchableOpacity
                  style={globalStyles.button}
                  onPress={() => handleRSVP(item.id)} >
                  <Text style={globalStyles.buttonText}>
                    {isAttending ? 'Cancelar Asistencia' : 'Confirmar Asistencia'}
                  </Text>
                </TouchableOpacity>
              )}

               {/* Mostrar formulario de reseña o mensaje según el estado */}
            {!isAdmin && item.status === 'closed' && (
              isAttending ? (
                !item.reviews?.some((review) => review.userId === auth().currentUser.uid) ? (
                  <View>
                    <Text style={globalStyles.cardTitle}>Deja una reseña</Text>
                    <TextInput
                      placeholder="Escribe tu reseña..."
                      value={review}
                      onChangeText={setReview}
                      style={globalStyles.input}
                    />
                    <TextInput
                      placeholder="Calificación (1-5)"
                      value={rating ? rating.toString() : ''}
                      onChangeText={(text) => setRating(Number(text))}
                      keyboardType="numeric"
                      style={globalStyles.input}
                    />
                    <TouchableOpacity
                      style={globalStyles.button}
                      onPress={() => handleSubmitReview(item.id)}
                    >
                      <Text style={globalStyles.buttonText}>Enviar Reseña</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={{ color: 'green', marginTop: 10 }}>Ya has dejado una reseña para este evento</Text>
                )
              ) : (
                <Text style={{ color: 'red', marginTop: 10 }}>No puedes dejar reseña, no participaste</Text>
              )
            )}

              {/* Mostrar botón de edición solo si el usuario es admin y el evento no está cerrado */}
              {isAdmin && item.status !== 'closed' && (
                <TouchableOpacity
                  style={globalStyles.button}
                  onPress={() => handleEditEvent(item.id)}>
                  <Text style={globalStyles.buttonText}>Editar Evento</Text>
                </TouchableOpacity>
              )}

              {/* Mostrar botón de cierre solo si el usuario es admin y el evento no está cerrado */}
              {isAdmin && item.status !== 'closed' && (
                <TouchableOpacity
                  style={globalStyles.button}
                  onPress={() => handleCloseEvent(item.id)}>
                  <Text style={globalStyles.buttonText}>Cerrar Evento</Text>
                </TouchableOpacity>
              )}
            </View>
        );
      }}
    />
  </View>
  );
};

export default EventSearchScreen;
