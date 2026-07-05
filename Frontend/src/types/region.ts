/** Mirrors the backend Region entities (Backend/src/region). */

/** GET /v1/states */
export interface State {
  id: string;
  name: string;
}

/** GET /v1/cities?state_id= */
export interface City {
  id: string;
  name: string;
  state_id: string;
}
