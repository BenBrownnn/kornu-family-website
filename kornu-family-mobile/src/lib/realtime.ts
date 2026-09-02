import { supabase } from './supabase';
import { notifyDataRefresh } from './dataRefresh';

let channel: ReturnType<typeof supabase.channel> | null = null;

export function startRealtime() {
  // Prevent duplicate subscriptions
  if (channel) {
    supabase.removeChannel(channel);
    channel = null;
  }

  channel = supabase
    .channel('kornu-family-live-updates')

    // Family members
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'members',
      },
      () => {
        console.log('REALTIME: members changed');
        notifyDataRefresh();
      }
    )

    // Marriages
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'marriages',
      },
      () => {
        console.log('REALTIME: marriages changed');
        notifyDataRefresh();
      }
    )

    // Parent / child relationships
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'parent_child_relationships',
      },
      () => {
        console.log(
          'REALTIME: parent-child relationships changed'
        );
        notifyDataRefresh();
      }
    )

    // Events
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'events',
      },
      () => {
        console.log('REALTIME: events changed');
        notifyDataRefresh();
      }
    )

    // Announcements
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'announcements',
      },
      () => {
        console.log('REALTIME: announcements changed');
        notifyDataRefresh();
      }
    )

    // Messages
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
      },
      () => {
        console.log('REALTIME: messages changed');
        notifyDataRefresh();
      }
    )

    .subscribe((status) => {
      console.log(
        'KORNU REALTIME STATUS:',
        status
      );
    });

  return () => {
    if (channel) {
      supabase.removeChannel(channel);
      channel = null;
    }
  };
}