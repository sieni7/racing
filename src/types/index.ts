export type Player = {
  id: string;
  first_name: string;
  last_name: string;
  slug: string;
  jersey_number: number;
  position: string;
  date_of_birth: string;
  nationality: string;
  height_cm: number;
  weight_kg: number;
  preferred_foot: string;
  photo_url: string;
  bio: string;
  is_active: boolean;
  joined_at: string;
  left_at: string | null;
};

export type Match = {
  id: string;
  opponent_name: string;
  is_home: boolean;
  match_date: string;
  venue: string;
  competition: string;
  season: string;
  matchday: number;
  status: 'upcoming' | 'finished' | 'postponed';
  racing_score: number | null;
  opponent_score: number | null;
  summary: string;
};

export type NewsItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  status: string;
  published_at: string;
};

export type Staff = {
  id: string;
  first_name: string;
  last_name: string;
  slug: string;
  role: string;
  photo_url: string;
  bio: string;
  email: string;
  phone: string;
  is_active: boolean;
  hired_at: string;
  left_at: string | null;
};
