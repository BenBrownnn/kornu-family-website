
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import {
  Tabs,
  Stack,
  router,
  useSegments,
} from 'expo-router';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { startRealtime } from '../lib/realtime';

import {
  Home,
  Users,
  GitBranch,
  Image as ImageIcon,
  Calendar,
} from 'lucide-react-native';

export default function RootLayout() {
  const [session, setSession] =
    useState<Session | null>(null);

  const [loading, setLoading] =
    useState(true);

  const segments = useSegments();

  /*
   * ---------------------------------------------------------
   * LOAD AUTH SESSION
   * ---------------------------------------------------------
   */

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (mounted) {
        setSession(session);
        setLoading(false);
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * START GLOBAL SUPABASE REALTIME
   * ---------------------------------------------------------
   *
   * This listens for changes to:
   * - members
   * - marriages
   * - parent/child relationships
   * - events
   * - announcements
   * - messages
   *
   * The individual screens will use this signal to
   * reload their latest data.
   */

  useEffect(() => {
    if (!session) {
      return;
    }

    const stopRealtime = startRealtime(() => {
      console.log(
        'KORNU DATA CHANGED — live update received'
      );
    });

    return stopRealtime;
  }, [session]);

  /*
   * ---------------------------------------------------------
   * ROUTE PROTECTION
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (loading) return;

    const currentRoute = segments[0];

    if (
      !session &&
      currentRoute !== 'login'
    ) {
      router.replace('/login');
    }

    if (
      session &&
      currentRoute === 'login'
    ) {
      router.replace('/');
    }
  }, [
    session,
    loading,
    segments,
  ]);

  /*
   * ---------------------------------------------------------
   * LOADING SCREEN
   * ---------------------------------------------------------
   */

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          size="large"
          color="#0077B6"
        />
      </View>
    );
  }

  /*
   * ---------------------------------------------------------
   * LOGIN STACK
   * ---------------------------------------------------------
   */

  if (!session) {
    return (
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    );
  }

  /*
   * ---------------------------------------------------------
   * MAIN NAVIGATION
   * ---------------------------------------------------------
   */

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0077B6',
        tabBarInactiveTintColor: '#8A8A8A',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarStyle: {
          height: 70,
          paddingTop: 8,
          paddingBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({
            color,
            size,
          }) => (
            <Home
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="family"
        options={{
          title: 'Family',
          tabBarIcon: ({
            color,
            size,
          }) => (
            <Users
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="tree"
        options={{
          title: 'Tree',
          tabBarIcon: ({
            color,
            size,
          }) => (
            <GitBranch
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="gallery"
        options={{
          title: 'Gallery',
          tabBarIcon: ({
            color,
            size,
          }) => (
            <ImageIcon
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({
            color,
            size,
          }) => (
            <Calendar
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="login"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = {
  loading: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: '#F7F9FC',
  },
};
