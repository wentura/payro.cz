"use client";

/**
 * Soft Delete User Button Wrapper
 *
 * Client Component wrapper for SoftDeleteUserButton
 */

import SoftDeleteUserButton from "./SoftDeleteUserButton";

export default function SoftDeleteUserButtonWrapper({
  userId,
  isDeleted,
  isDeactivated,
}) {
  return (
    <SoftDeleteUserButton
      userId={userId}
      isDeleted={isDeleted}
      isDeactivated={isDeactivated}
    />
  );
}
