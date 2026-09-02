export function getTodaysBirthdays<
  T extends {
    birthDate?: string | null;
    dateOfPassing?: string | null;
  }
>(members: T[]): T[] {
  const today = new Date();

  const todayMonth = today.getMonth() + 1;
  const todayDate = today.getDate();

  return members.filter((member) => {
    // No birthday recorded
    if (!member.birthDate) {
      return false;
    }

    // Do not show birthdays for deceased members
    if (member.dateOfPassing) {
      return false;
    }

    // Expected format from Supabase:
    // YYYY-MM-DD
    const parts = member.birthDate.split('-');

    if (parts.length !== 3) {
      return false;
    }

    const birthMonth = Number(parts[1]);
    const birthDay = Number(parts[2]);

    return (
      birthMonth === todayMonth &&
      birthDay === todayDate
    );
  });
}

export function calculateAge(
  birthDate: string
): number {
  const parts = birthDate.split('-');

  if (parts.length !== 3) {
    return 0;
  }

  const birthYear = Number(parts[0]);
  const birthMonth = Number(parts[1]);
  const birthDay = Number(parts[2]);

  const today = new Date();

  let age =
    today.getFullYear() - birthYear;

  const birthdayThisYear = new Date(
    today.getFullYear(),
    birthMonth - 1,
    birthDay
  );

  if (today < birthdayThisYear) {
    age--;
  }

  return age;
}