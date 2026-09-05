/** Presentation metadata for student + face-enrolment statuses (shared by the
 *  student list and profile so labels/colours never drift apart). */

export const FACE_META = {
  enrolled: { label: 'Enrolled', cls: 'border-[#138808]/25 bg-green-50 text-[#16794f]' },
  pending: { label: 'Pending', cls: 'border-[#e2a610]/35 bg-amber-50 text-[#a15c00]' },
  requires_review: { label: 'Requires review', cls: 'border-[#D6262B]/25 bg-red-50 text-[#b23b3b]' },
  not_enrolled: { label: 'Not enrolled', cls: 'border-plum-950/15 bg-plum-50 text-plum-950/55' },
}

export const STATUS_META = {
  active: { label: 'Active', cls: 'border-[#138808]/25 bg-green-50 text-[#16794f]' },
  inactive: { label: 'Inactive', cls: 'border-plum-950/15 bg-plum-50 text-plum-950/55' },
  pending_verification: { label: 'Pending verification', cls: 'border-[#e2a610]/35 bg-amber-50 text-[#a15c00]' },
}

export function faceMeta(s) { return FACE_META[s] ?? FACE_META.not_enrolled }
export function statusMeta(s) { return STATUS_META[s] ?? STATUS_META.inactive }
