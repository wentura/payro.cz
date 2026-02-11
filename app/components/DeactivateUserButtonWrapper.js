/**
 * Deactivate User Button Wrapper
 *
 * Server wrapper that renders DeactivateUserButton (Client Component)
 * Server Components can directly import and render Client Components
 */
import DeactivateUserButton from "./DeactivateUserButton";

// Since this is already a Client Component, we can use the component directly
// But we'll keep it as a wrapper for consistency
export default function DeactivateUserButtonWrapper({ userId, isDeactivated }) {
  return (
    <DeactivateUserButton userId={userId} isDeactivated={isDeactivated} />
  );
}


