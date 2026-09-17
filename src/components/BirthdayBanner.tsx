import { useEffect, useState } from 'react';
import {
  Cake,
  X,
  Sparkles,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import {
  getTodaysBirthdays,
  calculateAge,
} from '../utils/birthdays';
import { familyMembers } from '../data/familyData';

type BirthdayMember = {
  id: string | number;
  name: string;
  image?: string;
  birthDate?: string | null;
  dateOfPassing?: string | null;
};

export default function BirthdayBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [todaysBirthdays, setTodaysBirthdays] = useState<
    BirthdayMember[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndCheck = async () => {
      const { data, error } = await supabase
        .from('members')
        .select(
          'id, name, image, birth_date, date_of_passing'
        );

      if (error) {
        console.error(
          'Unable to load birthday members:',
          error
        );
      }

      const dbMembers: BirthdayMember[] = (
        data || []
      ).map((m: any) => ({
        id: m.id,
        name: m.name,
        image:
          m.image || '/images/placeholder.jpg',
        birthDate: m.birth_date,
        dateOfPassing: m.date_of_passing,
      }));

      const staticMembers: BirthdayMember[] =
        familyMembers.map((m: any) => ({
          id: m.id,
          name: m.name,
          image: m.image,
          birthDate: m.birthDate,
          dateOfPassing: null,
        }));

      const allMembersForCheck: BirthdayMember[] = [
        ...dbMembers,
        ...staticMembers,
      ];

      const birthdays = getTodaysBirthdays(
        allMembersForCheck
      );

      setTodaysBirthdays(birthdays);
      setLoading(false);
    };

    fetchAndCheck();
  }, []);

  /* ============================================================
     LOADING STATE
  ============================================================ */
  if (loading) {
    return (
      <div className="sticky top-[64px] z-40 bg-gradient-to-r from-[#023570] via-[#0757A6] to-[#2E1065] text-white border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-center gap-2">

          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
            <Cake
              size={15}
              className="text-[#51A2FF]"
            />
          </div>

          <span className="text-xs sm:text-sm font-medium text-white/85">
            Checking today's birthdays...
          </span>

        </div>
      </div>
    );
  }

  /* ============================================================
     DISMISSED
  ============================================================ */
  if (dismissed) {
    return null;
  }

  /* ============================================================
     NO BIRTHDAYS
  ============================================================ */
  if (todaysBirthdays.length === 0) {
    return (
      <div className="sticky top-[64px] z-40 bg-[#102A43] text-white border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-center gap-2">

          <Cake
            size={16}
            className="text-[#51A2FF]"
          />

          <span className="text-xs sm:text-sm text-white/90">
            No birthdays today.
          </span>

        </div>
      </div>
    );
  }

  /* ============================================================
     BIRTHDAY ANNOUNCEMENT
  ============================================================ */
  return (
    <div className="sticky top-[64px] z-40 overflow-hidden bg-gradient-to-r from-[#023570] via-[#0757A6] to-[#2E1065] text-white border-b border-white/10 shadow-lg shadow-[#023570]/15">

      {/* Decorative glow */}
      <div className="absolute -left-20 -top-20 w-40 h-40 bg-[#51A2FF]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute -right-20 -bottom-20 w-40 h-40 bg-[#E9D5FF]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 py-3">

        <div className="flex items-center justify-between gap-4">

          {/* ====================================================
              BIRTHDAY MESSAGE
          ===================================================== */}
          <div className="flex items-center gap-3 min-w-0">

            {/* Cake Icon */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0">

              <Cake
                size={19}
                className="text-[#51A2FF]"
                strokeWidth={2}
              />

            </div>

            {/* Message */}
            <div className="min-w-0">

              <div className="flex items-center gap-1.5 mb-0.5">

                <Sparkles
                  size={12}
                  className="text-[#E9D5FF]"
                />

                <span className="text-[10px] sm:text-xs uppercase tracking-[0.16em] font-bold text-[#D0E6FF]">
                  Family Birthday
                </span>

              </div>

              <p className="text-xs sm:text-sm font-medium text-white leading-relaxed">

                Happy Birthday to{' '}

                {todaysBirthdays.map(
                  (member, index) => (
                    <span key={member.id}>

                      <strong className="font-bold text-white">
                        {member.name}
                      </strong>

                      {member.birthDate && (
                        <span className="text-white/65">
                          {' '}
                          (
                          {calculateAge(
                            member.birthDate
                          )}
                          th milestone)
                        </span>
                      )}

                      {index <
                        todaysBirthdays.length - 1
                        ? ', '
                        : ''}

                    </span>
                  )
                )}

                !

              </p>

            </div>
          </div>

          {/* ====================================================
              CLOSE BUTTON
          ===================================================== */}
          <button
            onClick={() => setDismissed(true)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:scale-105"
            aria-label="Dismiss birthday announcement"
          >

            <X
              size={15}
              className="text-white/75 hover:text-white"
            />

          </button>

        </div>

      </div>
    </div>
  );
}