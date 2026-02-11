/**
 * Soft Delete User Button Wrapper
 *
 * Server wrapper that renders SoftDeleteUserButton (Client Component)
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
