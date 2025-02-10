import {
  Env,
  FitbitActivity,
  OAuthRefreshTokenResponse,
  StravaActivity,
  StravaWebhookEvent,
} from './strava.types'

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  // Endpoint for Starva webhook setup
  if (request.method === 'GET') {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('hub.mode')
    const challenge = searchParams.get('hub.challenge')
    const token = searchParams.get('hub.verify_token')

    if (mode === 'subscribe' && token === env.STRAVA_WEBHOOK_SECRET) {
      return new Response(JSON.stringify({ 'hub.challenge': challenge }), {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 200,
      })
    }

    return new Response('Unauthorized hook registration', { status: 401 })
  }

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  try {
    const body = await request.json<StravaWebhookEvent>()

    if (!verifyRequest(body, env)) {
      return new Response('Unauthorized', { status: 401 })
    }

    if (body.aspect_type !== 'create') {
      return new Response('OK', { status: 200 })
    }

    const activity = await getStravaActivityData(env, body.object_id)
    const date = new Date(activity.start_date)

    await sendToFitbit(
      {
        activityName: activity.name,
        manualCalories: activity.calories,
        date: date.toISOString().split('T')[0],
        startTime: date.toISOString().split('T')[1].slice(0, 5),
        durationMillis: activity.moving_time * 1000,
        distance: activity.distance,
        distanceUnit: 'distance',
      },
      env,
    )

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error(error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

async function sendToFitbit(data: FitbitActivity, env: Env) {
  let accessToken = await getFitbitAccessToken(env)
  let response = await submitActivity(data, accessToken)

  if (response.status === 401) {
    accessToken = await refreshFitbitToken(env)
    response = await submitActivity(data, accessToken)
  }

  if (!response.ok) {
    const errors = await response.json()
    throw new Error('Failed to submit activity to Fitbit: ' + JSON.stringify(errors))
  }

  return await response.json()
}

function verifyRequest(event: StravaWebhookEvent, env: Env): boolean {
  return (
    event.subscription_id === Number(env.STRAVA_SUBSCRIPTION_ID) &&
    event.owner_id === Number(env.STRAVA_OWNER_ID)
  )
}

async function submitActivity(data: FitbitActivity, accessToken: string) {
  const params = new URLSearchParams()

  params.append('activityId', '90001')
  params.append('manualCalories', data.manualCalories.toString())
  params.append('date', data.date)
  params.append('startTime', data.startTime)
  params.append('durationMillis', data.durationMillis.toString())
  params.append('distance', (Number(data.distance) / 1000).toString())
  params.append('distanceUnit', 'Kilometer')

  return fetch('https://api.fitbit.com/1/user/-/activities.json', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })
}

async function getStravaActivityData(env: Env, activityId: number): Promise<StravaActivity> {
  let accessToken = await getStravaAccessToken(env)

  let response = await fetchStravaActivity(activityId, accessToken)

  if (response.status === 401) {
    accessToken = await refreshStravaToken(env)
    response = await fetchStravaActivity(activityId, accessToken)
  }

  if (!response.ok) {
    const errors = await response.json()
    throw new Error('Failed to fetch Strava activity: ' + JSON.stringify(errors))
  }

  return await response.json<StravaActivity>()
}

async function fetchStravaActivity(activityId: number, accessToken: string) {
  return fetch(`https://www.strava.com/api/v3/activities/${activityId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

async function getStravaAccessToken(env: Env) {
  const token = await env.OAUTH_TOKEN_KV.get('strava_access_token')
  if (token) {
    return token
  }

  return await refreshStravaToken(env)
}

async function refreshStravaToken(env: Env) {
  const currentToken = await env.OAUTH_TOKEN_KV.get('strava_refresh_token')

  if (!currentToken) {
    throw new Error('No refresh token found')
  }

  const response = await fetch('https://www.strava.com/api/v3/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: env.STRAVA_CLIENT_ID,
      client_secret: env.STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: currentToken,
    }),
  })

  if (response.ok) {
    const data = await response.json<OAuthRefreshTokenResponse>()

    await env.OAUTH_TOKEN_KV.put('strava_access_token', data.access_token)
    await env.OAUTH_TOKEN_KV.put('strava_refresh_token', data.refresh_token)

    return data.access_token
  }

  throw new Error('Failed to get access token')
}

async function getFitbitAccessToken(env: Env) {
  const token = await env.OAUTH_TOKEN_KV.get('fitbit_access_token')
  if (token) {
    return token
  }

  return await refreshFitbitToken(env)
}

async function refreshFitbitToken(env: Env) {
  const currentToken = await env.OAUTH_TOKEN_KV.get('fitbit_refresh_token')

  if (!currentToken) {
    throw new Error('No refresh token found')
  }

  const base64EncodedClientIdAndSecret = btoa(`${env.FITBIT_CLIENT_ID}:${env.FITBIT_CLIENT_SECRET}`)

    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', currentToken)

  const response = await fetch('https://api.fitbit.com/oauth2/token', {
    method: 'POST',
    headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${base64EncodedClientIdAndSecret}`,
    },
    body: params.toString(),
  })

  const data = await response.json<OAuthRefreshTokenResponse>()

  await env.OAUTH_TOKEN_KV.put('fitbit_access_token', data.access_token)
  await env.OAUTH_TOKEN_KV.put('fitbit_refresh_token', data.refresh_token)

  return data.access_token
}
