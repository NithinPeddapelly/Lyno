export interface User {
  id: string;
  name: string;
  username: string;
}

export interface Meeting {
  _id: string;
  user_id: string;
  meetingCode: string;
  date: string;
}

export interface ChatMessage {
  sender: string;
  data: string;
}

export interface AuthContextType {
  userData: User | null;
  setUserData: React.Dispatch<React.SetStateAction<User | null>>;
  handleRegister: (name: string, username: string, password: string) => Promise<string>;
  handleLogin: (username: string, password: string) => Promise<void>;
  getHistoryOfUser: () => Promise<Meeting[]>;
  addToUserHistory: (meetingCode: string) => Promise<void>;
  logout: () => void;
}

export interface VideoStream {
  socketId: string;
  stream: MediaStream;
  autoplay: boolean;
  playsinline: boolean;
}
