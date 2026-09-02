import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';

type Member = {
  id: string;
  name: string;
};

export default function HomeScreen() {
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFamilyCount();
  }, []);

  async function loadFamilyCount() {
    try {
      setLoading(true);

      const { count, error } = await supabase
        .from('members')
        .select('id', { count: 'exact', head: true });

      if (error) {
        console.error('Family count error:', error);
        return;
      }

      setMemberCount(count ?? 0);
    } catch (error) {
      console.error('Family count error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome to</Text>
          <Text style={styles.title}>Kornu Family</Text>
          <Text style={styles.subtitle}>
            Stay connected with your family, heritage and memories.
          </Text>
        </View>

        <View style={styles.welcomeCard}>
          <Text style={styles.cardTitle}>Our Family</Text>

          {loading ? (
            <ActivityIndicator
              size="small"
              color="#0077B6"
            />
          ) : (
            <Text style={styles.memberCount}>
              {memberCount}
            </Text>
          )}

          <Text style={styles.cardSubtitle}>
            {memberCount === 1
              ? 'Family member'
              : 'Family members'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Family at a glance
          </Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>
              Family Directory
            </Text>

            <Text style={styles.infoText}>
              View family members, generations, occupations,
              locations and important family information.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>
              Family Tree
            </Text>

            <Text style={styles.infoText}>
              Explore the relationships and generations that
              connect our family.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>
              Family Memories
            </Text>

            <Text style={styles.infoText}>
              Keep up with family photos, stories, events and
              important occasions.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },

  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },

  header: {
    marginBottom: 28,
  },

  greeting: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },

  title: {
    marginTop: 4,
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
  },

  subtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: '#6B7280',
  },

  welcomeCard: {
    backgroundColor: '#0077B6',
    borderRadius: 22,
    padding: 24,
    marginBottom: 28,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  memberCount: {
    marginTop: 12,
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  cardSubtitle: {
    marginTop: 2,
    fontSize: 14,
    color: '#E6F4FA',
  },

  section: {
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 14,
  },

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },

  infoText: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 21,
    color: '#6B7280',
  },
});