// Card Rest — the one shadow in the system (DESIGN.md § 4 Elevation). Applied
// identically to every card-shaped component, alongside the existing hairline
// border, never stacked or tuned per component.
//
// Uses the unified `boxShadow` string (RN 0.86+) rather than the discrete
// shadow* props, which RN now deprecates in favor of it. `elevation` stays as
// the Android-specific companion; RN doesn't derive it from `boxShadow`.
export const cardShadow = {
  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
  elevation: 2,
};
