import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { supabase, Track } from '../lib/supabase';

type Filter = 'indoor' | 'kids' | 'moto';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<Filter[]>([]);

  const loadTracks = useCallback(async () => {
    setErrorMsg(null);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permesso posizione negato. Attivalo per vedere le piste vicine a te.');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const { data, error } = await supabase.rpc('nearby_tracks', {
      user_lat: location.coords.latitude,
      user_lng: location.coords.longitude,
      radius_km: 100,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setTracks((data as Track[]) ?? []);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadTracks();
  }, [loadTracks]);

  const toggleFilter = (f: Filter) => {
    setActiveFilters((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  };

  const filteredTracks = tracks.filter((t) => {
    if (activeFilters.includes('indoor') && !t.indoor) return false;
    if (activeFilters.includes('kids') && !t.kids_friendly) return false;
    if (activeFilters.includes('moto') && !t.allows_minimoto) return false;
    return true;
  });

  const filterChip = (key: Filter, label: string) => (
    <TouchableOpacity
      style={[styles.chip, activeFilters.includes(key) && styles.chipActive]}
      onPress={() => toggleFilter(key)}
    >
      <Text style={[styles.chipText, activeFilters.includes(key) && styles.chipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#ff5a1f" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Piste vicino a te</Text>

      <View style={styles.filterRow}>
        {filterChip('indoor', 'Indoor')}
        {filterChip('kids', 'Per bambini')}
        {filterChip('moto', 'Mini moto')}
      </View>

      {errorMsg && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}

      <FlatList
        data={filteredTracks}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadTracks();
            }}
            tintColor="#ff5a1f"
          />
        }
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          !errorMsg ? (
            <Text style={styles.emptyText}>Nessuna pista trovata nel raggio di 100 km.</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('TrackDetail', { trackId: item.id })}
          >
            <Image
              source={{ uri: item.images?.[0] ?? 'https://placehold.co/400x240?text=Pista+Kart' }}
              style={styles.cardImage}
            />
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardAddress}>{item.address}</Text>
              <View style={styles.cardMetaRow}>
                {item.distance_km !== undefined && (
                  <Text style={styles.cardDistance}>{item.distance_km.toFixed(1)} km</Text>
                )}
                {item.price_info && <Text style={styles.cardPrice}>{item.price_info}</Text>}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111318', paddingTop: 60, paddingHorizontal: 16 },
  center: { flex: 1, backgroundColor: '#111318', justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 14 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1c1f26',
    borderWidth: 1,
    borderColor: '#2a2e37',
  },
  chipActive: { backgroundColor: '#ff5a1f', borderColor: '#ff5a1f' },
  chipText: { color: '#9aa0ab', fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  errorBox: { backgroundColor: '#2a1c1c', padding: 12, borderRadius: 10, marginBottom: 14 },
  errorText: { color: '#ff8a8a', fontSize: 13 },
  emptyText: { color: '#9aa0ab', textAlign: 'center', marginTop: 40 },
  card: {
    backgroundColor: '#1c1f26',
    borderRadius: 16,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2a2e37',
  },
  cardImage: { width: '100%', height: 140, backgroundColor: '#2a2e37' },
  cardBody: { padding: 14 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  cardAddress: { fontSize: 13, color: '#9aa0ab', marginTop: 2 },
  cardMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  cardDistance: { color: '#ff5a1f', fontWeight: '700', fontSize: 13 },
  cardPrice: { color: '#9aa0ab', fontSize: 13 },
});
