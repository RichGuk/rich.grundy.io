# Strava to Fitbit

I cannot for the life of me get the official Strava/Fitbit sync to work. So as a fun exercise to
refresh my understanding of Cloudflare workers I decided to write my own sync.

There are a few things you need to do externally to get Strava webhooks working and oauth setup for both APIs.

## Strava setup

Create apps on: https://www.strava.com/settings/api


## Strava webhook

STRAVA_WEBHOOK_SECRET is along random string you can use to verify the request
coming form Strava to setup webhook.


curl -X POST https://www.strava.com/api/v3/push_subscriptions \
-F client_id=<STRAVA_CLIENT_ID> \
-F client_secret=<STRAVA_CLIENT_SECRET> \
-F callback_url=https://rich.grundy.io/webhook \
-F verify_token=<STRAVA_WEBHOOK_SECRET>

This will give you a subscription id and your owner id. This hook uses to do
some basic verification for future webhook requests.

## Strava OAuth

We can then authorize the app via OAuth to access our data via the API.

Browse to here:

https://www.strava.com/oauth/mobile/authorize?client_id=<STRAVA_CLIENT_ID>&redirect_uri=https://rich.grundy.io&response_type=code&approval_prompt=auto&scope=activity:read_all

Once authorized, it will redirect back to our URL with a query string param called `code`.

e.g `?code=dab7438c9fd5d97b6acc2f248d32e8e7ab347e6a`

Take this code and generate our initial access token and refresh token.

curl -X POST https://www.strava.com/api/v3/oauth/token \
  -d client_id=<STRAVA_CLIENT_ID> \
  -d client_secret=<STRAVA_CLIENT_SECRET> \
  -d code=dab7438c9fd5d97b6acc2f248d32e8e7ab347e6a \
  -d grant_type=authorization_code

This will give you the tokens in the response.

Next we can set the refresh_token within the KV store on cloudflare so that we can let the code
refresh and manage the access token itself.

Production:
```
wrangler kv:key put strava_refresh_token <STRAVA_REFRESH_TOKEN> --binding OAUTH_TOKEN_KV
```

Locally:
```
wrangler kv:key put strava_refresh_token <STRAVA_REFRESH_TOKEN> --local --binding OAUTH_TOKEN_KV
```


## FitBit OAuth

Same thing for Fitbit, open this URL and authorize

https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=<FITBIT_CLIENT_ID>&redirect_uri=https://rich.grundy.io/hooks/strava&scope=activity&expires_in=604800

Get the code from the returned URL (ignore the # at the end)


`code=dab7438c9fd5d97b6acc2f248d32e8e7ab347e6a#_0`


curl -X POST "https://api.fitbit.com/oauth2/token" \
     -H "Authorization: Basic $(echo -n <FITBIT_CLIENT_ID>:<FITBIT_CLIENT_SECRET> | base64)" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "client_id=<FITBIT_CLIENT_ID>&grant_type=authorization_code&redirect_uri=https://rich.grundy.io/hooks/strava&code=dab7438c9fd5d97b6acc2f248d32e8e7ab347e6a"

```
wrangler kv:key put fitbit_refresh_token <STRAVA_REFRESH_TOKEN> --binding OAUTH_TOKEN_KV
```

Locally:
```
wrangler kv:key put fitbit_refresh_token <STRAVA_REFRESH_TOKEN> --local --binding OAUTH_TOKEN_KV
```
