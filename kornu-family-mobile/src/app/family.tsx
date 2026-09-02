import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { subscribeToDataRefresh } from '../lib/dataRefresh';

type Member = {
  id: string;
  name: string;
  role: string | null;
  age: number | null;
  bio: string | null;
  image: string | null;
  generation: number | null;
  birth_date: string | null;
  date_of_passing: string | null;
  location: string | null;
  occupation: string | null;
  tags: string[] | null;
};

export default function FamilyScreen() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      console.log('MOBILE SESSION:', session);
      console.log('SESSION ERROR:', sessionError);

      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('generation', { ascending: true });

      console.log('MEMBERS DATA:', data);
      console.log('MEMBERS ERROR:', error);

      if (error) {
        throw error;
      }

      setMembers(data ?? []);
    } catch (err) {
      console.error(
        'Error loading family members:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load family members.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  // Automatic realtime refresh
  useEffect(() => {
    const unsubscribe = subscribeToDataRefresh(() => {
      console.log(
        'FAMILY PAGE: refreshing members...'
      );

      loadMembers();
    });

    return unsubscribe;
  }, [loadMembers]);

  function formatDate(date: string | null) {
    if (!date) return '';

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  function renderMember({ item }: { item: Member }) {
    return (
      <View style={styles.card}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={styles.image}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>
              {item.name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
        )}

        <View style={styles.details}>
          <Text style={styles.name}>
            {item.name}
          </Text>

          {item.role ? (
            <Text style={styles.role}>
              {item.role}
            </Text>
          ) : null}

          {item.generation ? (
            <Text style={styles.generation}>
              Generation {item.generation}
            </Text>
          ) : null}

          {item.occupation ? (
            <Text style={styles.info}>
              {item.occupation}
            </Text>
          ) : null}

          {item.location ? (
            <Text style={styles.info}>
              {item.location}
            </Text>
          ) : null}

          {item.birth_date ? (
            <Text style={styles.info}>
              Born: {formatDate(item.birth_date)}
            </Text>
          ) : null}

          {item.date_of_passing ? (
            <Text style={styles.info}>
              Passed: {formatDate(item.date_of_passing)}
            </Text>
          ) : null}
        </View>
      </View>
    );
  }

  if (loading && members.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#0077B6"
        />

        <Text style={styles.loadingText}>
          Loading family members...
        </Text>
      </View>
    );
  }

  if (error && members.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Our Family
        </Text>

        <Text style={styles.subtitle}>
          {members.length} family member
          {members.length === 1 ? '' : 's'}
        </Text>
      </View>

      <FlatList
        data={members}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderMember}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadMembers}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              No family members yet
            </Text>

            <Text style={styles.emptyText}>
              Family members added through the family
              portal will appear here.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },

  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 18,
    backgroundColor: '#FFFFFF',
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
  },

  subtitle: {
    marginTop: 5,
    fontSize: 15,
    color: '#6B7280',
  },

  list: {
    padding: 16,
    paddingBottom: 30,
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 5,
  },

  image: {
    width: 82,
    height: 82,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
  },

  imagePlaceholder: {
    width: 82,
    height: 82,
    borderRadius: 16,
    backgroundColor: '#E6F4FA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  placeholderText: {
    fontSize: 30,
    fontWeight: '700',
    color: '#0077B6',
  },

  details: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },

  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  role: {
    marginTop: 3,
    fontSize: 14,
    color: '#0077B6',
    fontWeight: '600',
  },

  generation: {
    marginTop: 4,
    fontSize: 13,
    color: '#6B7280',
  },

  info: {
    marginTop: 3,
    fontSize: 13,
    color: '#6B7280',
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F9FC',
    padding: 20,
  },

  loadingText: {
    marginTop: 12,
    color: '#6B7280',
  },

  error: {
    color: '#B91C1C',
    fontSize: 16,
    textAlign: 'center',
  },

  empty: {
    alignItems: 'center',
    padding: 40,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  emptyText: {
    marginTop: 8,
    textAlign: 'center',
    color: '#6B7280',
    lineHeight: 21,
  },
});