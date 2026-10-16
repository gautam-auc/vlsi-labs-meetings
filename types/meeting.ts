export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  duration?: string;
  participants: string[];
  status: "upcoming" | "live" | "completed";
  host?: string;
  hostEmail?: string;
  recordingsCount?: number;
  storageMB?: number;
  notes?: string;
}
