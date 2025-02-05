export interface Env {
  STRAVA_WEBHOOK_SECRET: string
  STRAVA_CLIENT_ID: string
  STRAVA_CLIENT_SECRET: string
  STRAVA_SUBSCRIPTION_ID: string
  STRAVA_OWNER_ID: string
  FITBIT_CLIENT_ID: string
  FITBIT_CLIENT_SECRET: string
  OAUTH_TOKEN_KV: KVNamespace
}

export interface OAuthRefreshTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
}

export interface StravaWebhookEvent {
  aspect_type: 'create' | 'update' | 'delete'
  event_time: number
  object_id: number
  object_type: string
  owner_id: number
  subscription_id: number
  updates: {
    title: string
    type: string
    private: boolean
  }
}
export interface StravaActivity {
  id: number
  name: string
  distance: number // in meters
  moving_time: number // in seconds
  elapsed_time: number // in seconds
  total_elevation_gain: number
  type: string
  start_date: string
  timezone: string
  kudos_count: number
  calories: number
  sport_type: 'Run' | 'Ride' | 'MountainBikeRide' | 'Swim' | 'Workout' | 'Hike' | 'Walk'
}

export interface FitbitActivity {
  activityName: string
  manualCalories: number
  date: string
  startTime: string
  durationMillis: number
  distance: number
  distanceUnit: 'distance'
}
