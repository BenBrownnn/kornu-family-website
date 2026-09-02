import { useEffect, useState } from 'react';
import { Cake, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { getTodaysBirthdays, calculateAge } from '../utils/birthdays';
import { familyMembers } from '../data/familyData';

export default function BirthdayBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [todaysBirthdays, setTodaysBirthdays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndCheck = async () => {
      console.log('🎂 BirthdayBanner started');

      const { data, error } = await supabase
        .from('members')
        .select('id, name, image, birth_date, date_of_passing');

      console.log('🎂 Members returned:', data);
      console.log('🎂 Members error:', error);

      const dbMembers = (data || []).map((m: any) => ({
        id: m.id,
        name: m.name,
        image: m.image || '/images/placeholder.jpg',
        birthDate: m.birth_date,
        dateOfPassing: m.date_of_passing,
      }));

      const staticMembers = familyMembers.map((m: any) => ({
        id: m.id,
        name: m.name,
        image: m.image,
        birthDate: m.birthDate,
        dateOfPassing: null,
      }));

      const allMembersForCheck = [
        ...dbMembers,
        ...staticMembers,
      ];

      console.log(
        '🎂 All members:',
        allMembersForCheck
      );

      const birthdays = getTodaysBirthdays(
        allMembersForCheck
      );

      console.log(
        '🎂 TODAY\'S BIRTHDAYS:',
        birthdays
      );

      setTodaysBirthdays(birthdays);
      setLoading(false);
    };

    fetchAndCheck();
  }, []);

  if (loading) {
    return (
      <div className="bg-orange-500 text-white px-4 py-3 text-center">
        🎂 Checking today's birthdays...
      </div>
    );
  }

  if (dismissed) {
    return null;
  }

  if (todaysBirthdays.length === 0) {
    return (
      <div className="bg-gray-800 text-white px-4 py-3 text-center text-sm">
        🎂 No birthday found for today.
      </div>
    );
  }

  return (
   <div className="sticky top-[64px] z-40 bg-gradient-to-r from-pink-500 via-orange-500 to-pink-500 text-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Cake size={20} />

          <p className="text-sm font-medium">
             Happy Birthday to{' '}

            {todaysBirthdays.map((member, index) => (
              <span key={member.id}>
                <strong>{member.name}</strong>

                {member.birthDate &&
                  ` (honoring a ${calculateAge(member.birthDate)}th milestone)`}

                {index < todaysBirthdays.length - 1
                  ? ', '
                  : ''}
              </span>
            ))}

            !
          </p>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 hover:opacity-70"
        >

            
          <X size={16} />
        </button>
      </div>
    </div>
  );
}