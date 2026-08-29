export interface FamilyMember {
  id: string;
  name: string;
  role: string;
  age?: number;
  bio: string;
  image: string;
  generation: number;
  birthDate?: string;
  location?: string;
  occupation?: string;
  tags?: string[];
}

export interface FamilyEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  type: 'reunion' | 'birthday' | 'wedding' | 'memorial' | 'celebration';
  image?: string;
  rsvpCount?: number;
}

export interface FamilyStory {
  id: string;
  title: string;
  author: string;
  date: string;
  content: string;
  excerpt: string;
  image?: string;
  likes: number;
  comments: number;
  tags: string[];
}

export interface GalleryItem {
  id: string;
  src: string;
  title: string;
  date: string;
  category: string;
  description: string;
}
/* 
export const familyMembers: FamilyMember[] = [
  {
    id: '1',
    name: 'GranPa John Lily Kornu',
    role: 'Family Patriarch',
    age: 78,
    bio: 'The beloved patriarch of the Kornu family. A retired teacher who dedicated 45 years to education. His wisdom and stories shape our family identity.',
    image: '/images/members/kweku.jpg',
    generation: 1,
    birthDate: '1946-03-15',
    location: 'Accra, Ghana',
    occupation: 'Retired Educator',
    tags: ['Patriarch', 'Educator', 'Storyteller'],
  },
  {
    id: '2',
    name: 'Charlotte Kornu',
    role: 'Family Matriarch',
    age: 92,
    bio: 'The heart of the Kornu household. A master chef, herbalist, and A Mother to All. Her love is expressed through every meal she prepares.',
    image: '/images/members/Granny.webp',
    generation: 1,
    birthDate: '1923-01-16',
    location: 'Ve-Gbodome, Ghana',
    occupation: 'Mother For All',
    tags: ['Matriarch', 'Queen', 'Cook'],
  },
  {
    id: '3',
    name: 'Dominic Kofi Kornu',
    role: 'Son · Family Admin',
    age: 45,
    bio: 'Eldest son and family administrator. An accomplished engineer who bridges tradition and modernity. Kofi started this website to keep the family connected.',
    image: '/images/members/kofi.jpg',
    generation: 2,
    birthDate: '1972-11-05',
    location: 'London, UK',
    occupation: 'Civil Engineer',
    tags: ['Engineer', 'Admin', 'Leader'],
  },
  {
    id: '4',
    name: 'Ama Kornu-Mensah',
    role: 'Daughter · Teacher',
    age: 48,
    bio: 'A passionate educator and mother of three. Ama runs a community school in Kumasi and is known for her infectious laughter and generous spirit.',
    image: '/images/members/ama.jpg',
    generation: 2,
    birthDate: '1976-02-14',
    location: 'Kumasi, Ghana',
    occupation: 'School Principal',
    tags: ['Educator', 'Mother', 'Community Leader'],
  },
  {
    id: '5',
    name: 'Kwame Kornu',
    role: 'Son · Doctor',
    age: 45,
    bio: 'A dedicated physician serving in rural health centers across Ghana. Kwame\'s compassion and medical expertise have touched thousands of lives.',
    image: '/images/members/kwame.jpg',
    generation: 2,
    birthDate: '1979-09-30',
    location: 'Tamale, Ghana',
    occupation: 'Medical Doctor',
    tags: ['Doctor', 'Philanthropist', 'Healer'],
  },
  {
    id: '6',
    name: 'Akua Kornu',
    role: 'Granddaughter · Artist',
    age: 26,
    bio: 'A rising visual artist whose work celebrates African heritage. Akua\'s paintings have been exhibited across Europe and Africa. She brings color to everything she touches.',
    image: '/images/members/akua.jpg',
    generation: 3,
    birthDate: '1998-04-18',
    location: 'Paris, France',
    occupation: 'Visual Artist',
    tags: ['Artist', 'Creative', 'Trailblazer'],
  },
  {
    id: '7',
    name: 'Yaw Kornu',
    role: 'Grandson · Engineer',
    age: 29,
    bio: 'A software engineer at a leading tech startup. Yaw built the Kornu family app and is passionate about using technology to preserve African culture.',
    image: '/images/members/yaw.jpg',
    generation: 3,
    birthDate: '1995-12-01',
    location: 'Accra, Ghana',
    occupation: 'Software Engineer',
    tags: ['Tech', 'Developer', 'Innovator'],
  },
  {
    id: '8',
    name: 'Efua Kornu-Asante',
    role: 'Granddaughter · Nurse',
    age: 24,
    bio: 'Following in her uncle Kwame\'s footsteps, Efua is a dedicated pediatric nurse. She is known for her gentle care and bright smile that comforts patients.',
    image: '/images/members/efua.jpg',
    generation: 3,
    birthDate: '2000-06-08',
    location: 'Accra, Ghana',
    occupation: 'Pediatric Nurse',
    tags: ['Nurse', 'Caregiver', 'Compassionate'],
  },
];
*/

export const familyEvents: FamilyEvent[] = [
  {
    id: '1',
    title: 'Kornu Annual Family Reunion 2025',
    date: '2025-08-15',
    location: 'Accra, Ghana – Family Compound',
    description: 'Our most cherished gathering of the year! All family members are invited to join us for three days of food, music, storytelling, and celebration of the Kornu legacy.',
    type: 'reunion',
    image: '/images/family-gathering.jpg',
    rsvpCount: 67,
  },
  {
    id: '2',
    title: 'Elder Kweku\'s 79th Birthday Celebration',
    date: '2025-03-15',
    location: 'Accra, Ghana',
    description: 'Help us celebrate our beloved patriarch as he turns 79! Join us for a special dinner, speeches, and a surprise ceremony in his honor.',
    type: 'birthday',
    rsvpCount: 43,
  },
  {
    id: '3',
    title: 'Akua\'s Art Exhibition: "Roots & Wings"',
    date: '2025-05-20',
    location: 'National Museum, Accra',
    description: 'Our talented granddaughter Akua Kornu opens her first solo exhibition in Ghana. Come celebrate her achievements and be inspired by her magnificent artwork.',
    type: 'celebration',
    rsvpCount: 28,
  },
  {
    id: '4',
    title: 'Kornu Christmas Dinner 2025',
    date: '2025-12-25',
    location: 'Accra, Ghana – Family Compound',
    description: 'The most magical night of the year — family, faith, and feasting! Mama Abena will prepare her legendary recipes. Live music by the Kornu Band.',
    type: 'celebration',
    image: '/images/gallery1.jpg',
    rsvpCount: 54,
  },
  {
    id: '5',
    title: 'Remembrance Day – Grandpa Osei Kornu',
    date: '2025-09-10',
    location: 'Kornu Family Cemetery, Accra',
    description: 'Annual memorial gathering to honor the memory of our late grandfather Osei Kornu. A time for reflection, prayer, and sharing cherished memories.',
    type: 'memorial',
    rsvpCount: 35,
  },
];

export const familyStories: FamilyStory[] = [
  {
    id: '1',
    title: 'The Day Grandfather Kweku Walked 40 Miles for Love',
    author: 'Kofi Kornu',
    date: '2024-12-01',
    excerpt: 'Long before cars were common in our village, grandfather Kweku walked from Kumasi to Accra — 40 miles on foot — just to ask grandmother Abena\'s father for her hand in marriage.',
    content: `Long before cars were common in our village, grandfather Kweku walked from Kumasi to Accra — 40 miles on foot — just to ask grandmother Abena\'s father for her hand in marriage.

It was the rainy season of 1968. He had saved for three months to buy fabric for a proper outfit. When he finally arrived, covered in mud but standing tall, Grandma Abena's father looked at him and said: "Any man who walks 40 miles for my daughter deserves her."

That evening, they sat under the great mango tree and grandfather told grandmother about his dream: to build a family that would stand for generations. A family of love, dignity, and service.

Today, that dream lives in every one of us. The Kornu family is his greatest masterpiece.`,
    image: '/images/family-tree.jpg',
    likes: 48,
    comments: 12,
    tags: ['Heritage', 'Love Story', 'Grandfather'],
  },
  {
    id: '2',
    title: 'How Mama Abena\'s Garden Saved the Village',
    author: 'Ama Kornu-Mensah',
    date: '2024-10-15',
    excerpt: 'In 1984, when drought devastated crops across the region, Mama Abena\'s medicinal garden became the village\'s lifeline. Her knowledge of plants and healing fed and healed dozens of families.',
    content: `In 1984, when drought devastated crops across the region, Mama Abena's medicinal garden became the village's lifeline.

What most people didn't know was that for years, our grandmother had quietly cultivated an extensive garden of both food plants and medicinal herbs. She learned from her own grandmother, who was a well-known healer.

During those difficult months, she shared her harvest freely. She prepared traditional medicines for the sick and taught young women which plants were safe to eat. The village elders still talk about it.

"Abena's garden didn't just grow plants," one elder told me recently. "It grew hope."`,
    image: '/images/gallery3.jpg',
    likes: 62,
    comments: 18,
    tags: ['Heritage', 'Grandmother', 'Resilience'],
  },
  {
    id: '3',
    title: 'Growing Up Kornu: Lessons from the Family Table',
    author: 'Kwame Kornu',
    date: '2024-09-05',
    excerpt: 'Every Sunday, no matter where any of us were in the city, we came home. The family table was sacred — a place where problems were solved, laughter was loud, and food was always plenty.',
    content: `Every Sunday, no matter where any of us were in the city, we came home.

Dad would announce at exactly 1pm: "Food is ready!" And somehow, no matter the traffic or the distance, everyone appeared. It was almost magical.

The table was where I learned to listen. Where my sister Ama learned to debate. Where Kofi learned to lead. Father sat at the head, Mother at the other end, and the rest of us filled every chair.

We didn't have smartphones then. We had each other, and stories, and laughter that could be heard from the street.

Those Sundays built me. They built all of us. And I carry that table wherever I go.`,
    image: '/images/gallery2.jpg',
    likes: 71,
    comments: 24,
    tags: ['Memories', 'Food', 'Family Values'],
  },
];

export const galleryItems: GalleryItem[] = [
  {
    id: '1',
    src: '/images/memory1.webp',
    title: 'Family Reunion 1995',
    date: 'August 1995',
    category: 'Reunions',
    description: 'Our beautiful annual family gathering in Tema',
  },
  {
    id: '2',
    src: '/images/mom.jpg',
    title: 'Sunday Family Portrait',
    date: 'December 2023',
    category: 'Portraits',
    description: 'Three generations together in the family compound',
  },
  {
    id: '3',
    src: '/images/family-tree.jpg',
    title: 'Grandparents & Grandchildren',
    date: 'June 2023',
    category: 'Portraits',
    description: 'Elder Kweku with his beloved grandchildren',
  },
  {
    id: '4',
    src: '/images/gallery1.jpg',
    title: 'Christmas 2023',
    date: 'December 2023',
    category: 'Celebrations',
    description: 'Festive celebrations at the family compound',
  },
  {
    id: '5',
    src: '/images/gallery2.jpg',
    title: 'Family Adventure',
    date: 'July 2023',
    category: 'Adventures',
    description: 'The Kornu family exploring the beautiful outdoors',
  },
  {
    id: '6',
    src: '/images/gallery3.jpg',
    title: 'Cooking with Mama',
    date: 'March 2024',
    category: 'Traditions',
    description: 'Passing down traditional recipes to the next generation',
  },
];