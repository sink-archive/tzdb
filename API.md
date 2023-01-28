# Worker API Docs

These docs serve to
 - make it clear how the worker API should work
 - map out and decide how the API should work, detached from implementation
 - help those who may wish to build a custom client, or at least look users up

## Useful notes for talking to the API

Some endpoints require data passed inline in the URL path.
This is denoted with a `:data` syntax in this document.
These must be in the correct order.

Some endpoints use query parameters.
This is denoted with a `?param1=...&param2=...` syntax in this document.
Ignoring the ordering in this document, query parameter order is entirely
interchangeable.

For POST endpoints that use query params, you should use
`application/x-www-form-urlencoded` encoding.
This header is never read by the server, but it will expect this format.

## Logging in

You should obtain a session token by first logging into a linked
3rd party service and then sending us that token.

This is most often done via OAuth2.

More details on this will be explained here later,
with a brief guide for an example service.

// TODO

## Authorizing with endpoints

Authed endpoints require a valid session token in HTTP headers
`Authorization: xxxxxxxx`.

You need not pass your account ID to any endpoints,
as authed endpoints can obtain it from this token.

Session tokens last 30 minutes,
and the timer is reset every time you call an authed endpoint,
as long as the auth is accepted, regardless of if the request succeeds.

## Timezone parts

*Timezone origins* are string codes that match an hour offset from UTC.

*Timezone offsets* are hour offsets from the origin.

When you pass an origin to the API, expect it to treat it case-insensitively.

You should also treat origins returned from the API case-insensitively,
but if you need to for any technical reason,
you can safely assume that any returned origins be all-uppercase.

## Returned object types

```ts
type AccountObject = {
	id: string;
	origin: Timezone; // string
	offset: number;

	services: {
		discord?: string;
	};
}

type TimezoneLookupObject = {
	origin: Timezone;
	offset: number;
	// the resolved offset from UTC based on the origin and offset
	utcOffset: number;
}
```

## GET `/tzlist`

Returns the list of timezone origins, in a few useful forms.

```json
{
	"tzsByOffset": {
		"-6": ["CT", "CST"],
		"2": ["CAT", "EET", "..."],
		"...etc": []
	},
	"tzKeywords": ["CST", "EST", "GMT", "..."],
	"tzOffsetsByKey": {
		"GMT": 0,
		"ACST": 9.5,
		"...": 0
	}
}
```

## GET `/self` (AUTHED)

Get your own account object

## GET `/:service/lookup/:id`

Get the timezone object of a user by an external ID

## POST `/:service/assoc?token=...` (AUTHED)

Links your account on the given service to TZDB.

The token should be an auth token for the given service
obtained via OAuth2 or otherwise.
The server will use this token to:
 - Log into the service as you
   * You should only provide limited scopes for this reason, see SERVICES.md
   * This is how the server verifies that you do, in fact, own the external account
 - Request your own user ID
 - Link the ID to your TZDB account
 - Throw away your token. We do not store it.

If you already have a connection to the given service, this will fail.
You should use `/reassoc`.

## POST `/:service/reassoc?token=...` (AUTHED)

All that applies to `/assoc` applies here.

The purpose of this is to modify an existing association.

Fails if you are not already linked to this service.

Why not just `/deassoc` then `/assoc`?
Because the API will not allow you to remove your last remaining association,
so if you move accounts on a service and its the only one you have linked,
you would otherwise be unable to move it.

## DELETE `/:service/deassoc` (AUTHED)

Unlinks the external service irreversibly.

Fails if the given service is not linked.

Fails if this is only service linked to your account,
as otherwise you would be locked out as soon as your session token expired!

## POST `/acct/create?origin=...&offset=...`

Create an account with the given origin and offset.

In this WIP version of this spec, you can just create accounts,
but in future this will likely require Cloudflare Turnstile.

## POST `/acct/modify?origin=...&offset=...` (AUTHED)

Modify the timezone you have set for your current user.

## DELETE `/acct/delete` (AUTHED)

Be careful! If authed, instantly deletes your account irreversibly.

Please provide adequate user safeguards in your UI.

## POST `/auth/login?service=...&token=...`

Authenticate with a linked service,
then provide the token with this API to allow TZDB to verify you,
locate your account, and generate you a session token.

You will receive the session token in plaintext as the response body,
which you should provide to endpoints as detailed earlier in this document.

## POST `/auth/logout` (AUTHED)

Forcibly times your session token out immediately.