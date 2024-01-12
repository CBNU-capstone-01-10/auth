import type { File } from '../middleware/minions';
export interface ClientCreationInput {
  userId: number;
  name: string;
  uri: string;
  file?: File;
}

export interface PublicClientInfo {
  client_id: string;
  client_name: string;
  client_uri: string;
  logo_uri: string;
}