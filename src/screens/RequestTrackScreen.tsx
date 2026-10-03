import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function RequestTrackScreen() {
  const { session } = useAuth();
  const [trackName, setTrackName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!trackName || !contactEmail) {
      Alert.alert('Attenzione', 'Nome pista ed email sono obbligatori.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('gestore_requests').insert({
      requester_id: session?.user.id ?? null,
      track_name: trackName,
      contact_email: contactEmail,
      contact_phone: contactPhone || null,
      message: message || null,
    });
    setLoading(false);
    if (error) {
      Alert.alert('Errore', error.message);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <View style={styles.center}>
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.successTitle}>Richiesta inviata!</Text>
        <Text style={styles.successText}>
          Ti contatteremo via email per completare l'attivazione della tua pista sull'app.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
      <Text style={styles.title}>Aggiungi la tua pista</Text>
      <Text style={styles.subtitle}>
        Compila il form: ti ricontatteremo per attivare il tuo profilo gestore e permetterti di
        pubblicare post sulla tua scheda pista.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Nome della pista"
        placeholderTextColor="#8a8f98"
        value={trackName}
        onChangeText={setTrackName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email di contatto"
        placeholderTextColor="#8a8f98"
        autoCapitalize="none"
        keyboardType="email-address"
        value={contactEmail}
        onChangeText={setContactEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Telefono (opzionale)"
        placeholderTextColor="#8a8f98"
        keyboardType="phone-pad"
        value={contactPhone}
        onChangeText={setContactPhone}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Raccontaci qualcosa sulla tua pista..."
        placeholderTextColor="#8a8f98"
        multiline
        numberOfLines={4}
        value={message}
        onChangeText={setMessage}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Invio...' : 'Invia richiesta'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111318' },
  center: {
    flex: 1,
    backgroundColor: '#111318',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#9aa0ab', marginBottom: 24, lineHeight: 20 },
  input: {
    backgroundColor: '#1c1f26',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2e37',
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  button: {
    backgroundColor: '#ff5a1f',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  successIcon: { fontSize: 48, marginBottom: 16 },
  successTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 8 },
  successText: { fontSize: 14, color: '#9aa0ab', textAlign: 'center', lineHeight: 20 },
});
