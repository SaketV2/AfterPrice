export function publicSignupError(providerError: unknown) {
  void providerError
  return 'Your account could not be created. Check your details or try signing in.'
}
