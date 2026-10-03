import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

const roleLabels: Record<string, string> = {
  ospite: 'Ospite',
  gestore: 'Gestore pista',
  admin: 'Amministratore',
};

export default function ProfileScreen() {
  const { session, profile, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {(profile?.full_name ?? session?.user.email ?? '?').charAt(0).toUpperCase()}
        </Text>
      </View>
      <Text style={styles.name}>{profile?.full_name ?? 'Utente'}</Text>
      <Text style={styles.email}>{session?.user.email}</Text>
      <View style={styles.roleBadge}>
        <Text style={styles.roleText}>{roleLabels[profile?.role ?? 'ospite']}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
        <Text style={styles.logoutText}>Esci</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111318', alignItems: 'center', paddingTop: 80 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ff5a1f',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  name: { fontSize: 20, fontWeight: '700', color: '#fff' },
  email: { fontSize: 14, color: '#9aa0ab', marginTop: 4 },
  roleBadge: {
    marginTop: 12,
    backgroundColor: '#1c1f26',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a2e37',
  },
  roleText: { color: '#ff5a1f', fontWeight: '700', fontSize: 12 },
  logoutButton: { marginTop: 40, paddingVertical: 12, paddingHorizontal: 24 },
  logoutText: { color: '#ff8a8a', fontSize: 15, fontWeight: '600' },
});
