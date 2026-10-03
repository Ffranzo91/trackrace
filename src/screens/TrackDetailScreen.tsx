import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { supabase, Track, Post } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function TrackDetailScreen() {
  const route = useRoute<any>();
  const { trackId } = route.params;
  const { session } = useAuth();

  const [track, setTrack] = useState<Track | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [trackId]);

  const loadData = async () => {
    const { data: trackData } = await supabase
      .from('tracks')
      .select('*')
      .eq('id', trackId)
      .single();
    if (trackData) setTrack(trackData as Track);

    const { data: postsData } = await supabase
      .from('posts')
      .select('*')
      .eq('track_id', trackId)
      .order('created_at', { ascending: false });
    setPosts((postsData as Post[]) ?? []);

    if (session?.user) {
      const { data: followData } = await supabase
        .from('follows')
        .select('*')
        .eq('track_id', trackId)
        .eq('user_id', session.user.id)
        .maybeSingle();
      setIsFollowing(!!followData);
    }
    setLoading(false);
  };

  const toggleFollow = async () => {
    if (!session?.user) return;
    if (isFollowing) {
      await supabase.from('follows').delete().eq('track_id', trackId).eq('user_id', session.user.id);
      setIsFollowing(false);
    } else {
      await supabase.from('follows').insert({ track_id: trackId, user_id: session.user.id });
      setIsFollowing(true);
    }
  };

  if (loading || !track) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#ff5a1f" size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: track.images?.[0] ?? 'https://placehold.co/600x300?text=Pista+Kart' }}
        style={styles.heroImage}
      />

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{track.name}</Text>
          <TouchableOpacity
            style={[styles.followButton, isFollowing && styles.followButtonActive]}
            onPress={toggleFollow}
          >
            <Text style={[styles.followText, isFollowing && styles.followTextActive]}>
              {isFollowing ? 'Seguito ✓' : '+ Segui'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.address}>{track.address}</Text>

        <View style={styles.tagsRow}>
          {track.indoor && <Text style={styles.tag}>🏠 Indoor</Text>}
          {!track.indoor && <Text style={styles.tag}>☀️ Outdoor</Text>}
          {track.kids_friendly && <Text style={styles.tag}>👦 Bambini</Text>}
          {track.allows_minimoto && <Text style={styles.tag}>🏍️ Mini moto</Text>}
        </View>

        {track.price_info && <Text style={styles.price}>{track.price_info}</Text>}
        {track.description && <Text style={styles.description}>{track.description}</Text>}

        <Text style={styles.sectionTitle}>Ultimi aggiornamenti</Text>
        {posts.length === 0 && (
          <Text style={styles.emptyText}>Questa pista non ha ancora pubblicato post.</Text>
        )}
        {posts.map((post) => (
          <View key={post.id} style={styles.postCard}>
            {post.image_url && <Image source={{ uri: post.image_url }} style={styles.postImage} />}
            <Text style={styles.postContent}>{post.content}</Text>
            <Text style={styles.postDate}>
              {new Date(post.created_at).toLocaleDateString('it-IT', {
                day: 'numeric',
                month: 'long',
              })}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111318' },
  center: { flex: 1, backgroundColor: '#111318', justifyContent: 'center', alignItems: 'center' },
  heroImage: { width: '100%', height: 220, backgroundColor: '#2a2e37' },
  content: { padding: 18 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#fff', flex: 1, marginRight: 10 },
  followButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ff5a1f',
  },
  followButtonActive: { backgroundColor: '#ff5a1f' },
  followText: { color: '#ff5a1f', fontWeight: '700', fontSize: 13 },
  followTextActive: { color: '#fff' },
  address: { color: '#9aa0ab', fontSize: 14, marginTop: 6 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  tag: {
    backgroundColor: '#1c1f26',
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  price: { color: '#ff5a1f', fontWeight: '700', fontSize: 15, marginTop: 14 },
  description: { color: '#cfd3da', fontSize: 14, marginTop: 10, lineHeight: 20 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 26, marginBottom: 12 },
  emptyText: { color: '#9aa0ab', fontSize: 13 },
  postCard: {
    backgroundColor: '#1c1f26',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2e37',
  },
  postImage: { width: '100%', height: 160, borderRadius: 10, marginBottom: 10, backgroundColor: '#2a2e37' },
  postContent: { color: '#fff', fontSize: 14, lineHeight: 20 },
  postDate: { color: '#6d7280', fontSize: 11, marginTop: 8 },
});
