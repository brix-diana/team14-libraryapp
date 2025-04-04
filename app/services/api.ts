// member
export interface Member {
  memberId: number;
  email: string;
  password: string;
}

// sign up interface
export interface AccountSignup {
  email: string;
  password: string;
  group: string;
  firstName: string;
  middleName?: string;
  lastName: string;
}

// login interface
export interface AccountLogin {
  email: string;
  password: string;
}

// API Response
export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  userID?: number | string;
  user?: Member; // Add this property
}

// (4) ADD IT IN HERE
// now go to layouyt and fix any errors
export interface AuthData {
  isLoggedIn: boolean;
  memberID: number | null;
  groupID: string | null;
  firstName: string | null;
  lastName: string | null;
  address: string | null;
  middleName: string | null;
}

export interface Items {
  ItemID: number;
  Title: string;
  TypeName: string;
  Status: string;
}
