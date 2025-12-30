"use client";

/**
 * Deactivate User Button Wrapper
 *
 * Client Component wrapper for DeactivateUserButton
 * This is needed because dynamic imports with ssr: false cannot be used in Server Components
 */

import dynamic from "next/dynamic";
import DeactivateUserButton from "./DeactivateUserButton";

// Since this is already a Client Component, we can use the component directly
// But we'll keep it as a wrapper for consistency
export default function DeactivateUserButtonWrapper({ userId, isDeactivated }) {
  return (
    <DeactivateUserButton userId={userId} isDeactivated={isDeactivated} />
  );
}


