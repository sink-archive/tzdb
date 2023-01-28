export function verifySessionToken(tok: string) {
  // TODO: implement auth
  return true;
}

export function verifySessionTokenAndRespond(tok: string) {
  if (verifySessionToken(tok))
    return true;
  
  return new Response("That session token was invalid.", {status: 401})
}